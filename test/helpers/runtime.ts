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
  const [stackBefore, stackAfter] = tests.effect || [[], []];
  const host = mockConsoleHost();
  const runtime = new Runtime(host, {} as Executor);

  runtime.stack.stack = stackBefore;

  const routine = new Routine(RoutineType.Program);
  routine.chunk = chunk;

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

  t.same(runtime.stack.stack, stackAfter);
}
