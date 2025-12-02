import { Byte } from '../../bytecode/byte';
import { Chunk } from '../../bytecode/chunk';
import { Token, TokenKind } from '../../tokens';
import { Routine, RoutineType, Value } from '../../value';

export interface RoutineProps {
  type?: RoutineType;
  filename?: string;
  name?: string;
  constants: Value[];
  code: Byte[];
  lines: number[];
}

export function routine(props: RoutineProps): Routine {
  const routine = new Routine(
    props.type || RoutineType.Input,
    props.filename || null,
    props.name
      ? new Token({
          kind: TokenKind.Ident,
          index: 0,
          row: 0,
          offsetStart: 0,
          offsetEnd: props.name.length,
          text: props.name,
          value: props.name,
        })
      : null,
    0,
  );
  const ch = routine.chunk;
  routine.chunk = new Chunk();
  Object.assign(routine.chunk, {
    filename: ch.filename,
    routine: ch.routine,
    constants: props.constants,
    code: props.code,
    lines: props.lines,
  });
  return routine;
}

export function chunk(props: RoutineProps): Chunk {
  return routine(props).chunk;
}
