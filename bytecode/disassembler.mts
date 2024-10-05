import table from 'text-table';

import { formatter } from '../format.mjs';
import { bytesToShort } from './short.mjs';
import { OpCode } from './opcodes.mjs';
import { Chunk } from './chunk.mjs';

type LineNo = string;
type Offset = string;
type Code = string;
type Row = [LineNo, Offset, Code, string];

function chunkName(chunk: Chunk): string {
  return chunk.filename;
}

function toHex(value: number): string {
  return `0x${value.toString(16)}`;
}

export function disassemble(chunk: Chunk): string {
  const data: Row[] = [];
  const header = `=== Disassembly of ${chunkName(chunk)}: ===`;

  let offset = 0;
  let row: Row;

  while (offset < chunk.code.length) {
    [offset, row] = _disassembleInstruction(chunk, offset);
    data.push(row);
  }

  return `${header}\n${table(data)}`;
}

const FORWARD = 1;
// const BACKWARD = -1;

export function disassembleInstruction(chunk: Chunk, offset: number): string {
  const row = _disassembleInstruction(chunk, offset)[1];
  return table([row]);
}

function _disassembleInstruction(chunk: Chunk, offset: number): [number, Row] {
  let lineNo = 0;
  let code: number = 0xff;
  let row: Row;

  function advance(amount: number = 1): number {
    offset += amount;
    code = chunk.code[offset - 1];
    lineNo = chunk.lines[offset - 1];
    return code;
  }

  function peek(n: number = 0): number {
    return chunk.code[offset + n - 1];
  }

  function simple(code: string): Row {
    return [String(lineNo), String(offset), code, ''];
  }

  function constant(code: string): Row {
    return [
      String(lineNo),
      String(offset),
      code,
      formatter.format(chunk.constants[advance()]),
    ];
  }

  function jump(code: string, sign: number): Row {
    const jump = bytesToShort([peek(1), peek(2)]);

    const row: Row = [
      String(lineNo),
      String(offset),
      code,
      `${offset} -> ${offset + 3 + sign * jump}`,
    ];

    advance(2);

    return row;
  }

  switch (advance()) {
    case OpCode.Constant:
      row = constant('CONSTANT');
      break;
    case OpCode.Nil:
      row = simple('NIL');
      break;
    case OpCode.True:
      row = simple('TRUE');
      break;
    case OpCode.False:
      row = simple('FALSE');
      break;
    case OpCode.Pop:
      row = simple('POP');
      break;
    case OpCode.GetGlobal:
      row = constant('GET_GLOBAL');
      break;
    case OpCode.DefineGlobal:
      row = constant('DEFINE_GLOBAL');
      break;
    case OpCode.SetGlobal:
      row = constant('SET_GLOBAL');
      break;
    case OpCode.Eq:
      row = simple('NIL');
      break;
    case OpCode.Gt:
      row = simple('GT');
      break;
    case OpCode.Ge:
      row = simple('GE');
      break;
    case OpCode.Lt:
      row = simple('LT');
      break;
    case OpCode.Le:
      row = simple('LE');
      break;
    case OpCode.Ne:
      row = simple('NE');
      break;
    case OpCode.Not:
      row = simple('NOT');
      break;
    case OpCode.Add:
      row = simple('ADD');
      break;
    case OpCode.Sub:
      row = simple('SUB');
      break;
    case OpCode.Mul:
      row = simple('MUL');
      break;
    case OpCode.Div:
      row = simple('DIV');
      break;
    case OpCode.Neg:
      row = simple('NEG');
      break;
    case OpCode.Print:
      row = simple('PRINT');
      break;
    case OpCode.Exit:
      row = simple('EXIT');
      break;
    case OpCode.Jump:
      row = jump('JUMP', FORWARD);
      break;
    case OpCode.JumpIfFalse:
      row = jump('JUMP_IF_FALSE', FORWARD);
      break;
    case OpCode.Loop:
      row = simple('LOOP');
      break;
    case OpCode.Return:
      row = simple('RETURN');
      break;
    default:
      row = [String(lineNo), String(offset), 'Unknown opcode', toHex(code)];
  }

  return [offset, row];
}
