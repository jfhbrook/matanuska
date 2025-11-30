import { t } from './tap';

import { Exit } from '../../exit';
import { Chunk } from '../../bytecode/chunk';
import { Executor } from '../../executor';
import { formatter } from '../../format';
import { Runtime } from '../../runtime';
import { Routine, RoutineType, Value } from '../../value';

import { mockConsoleHost } from './host';

export interface ChunkTests {
  effect?: [Value[], Value[]];
  throws?: any;
  exitCode?: number;
}

export async function testChunk(
  chunk: Chunk,
  tests: ChunkTests = {},
): Promise<void> {
  const [stackBefore, stackAfter] = tests.effect || [
    [],
    [
      {
        arity: 0,
        filename: '<main>',
        name: '<main>',
        type: 1,
      },
    ],
  ];
  const host = mockConsoleHost();
  const runtime = new Runtime(host, {} as Executor);

  runtime.stack.stack = stackBefore;

  const routine = new Routine(RoutineType.Program);
  const chunkName = routine.chunk.routine;
  routine.chunk = chunk;
  routine.chunk.routine = chunkName;

  if (tests.throws) {
    t.throws(() => {
      try {
        runtime.interpret(routine);
      } catch (err) {
        if (!(err instanceof Exit)) {
          t.matchSnapshot(formatter.format(err));
          throw err;
        }
      }
    }, tests.throws);
    return;
  }

  try {
    await runtime.interpret(routine);
  } catch (err) {
    t.equal(err.exitCode, tests.exitCode || 0);
  }

  t.matchSnapshot(host.stdout.output);
  t.matchSnapshot(host.stderr.output);

  const stack = runtime.stack.stack.map((value) => {
    if (value instanceof Routine) {
      return {
        type: value.type,
        filename: value.filename,
        name: value.chunk.routine,
        arity: value.arity,
      };
    }
    return value;
  });

  t.same(stack, stackAfter);
}
