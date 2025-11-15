import { Let, Assign } from '../../ast/instr';
import { Variable, IntLiteral } from '../../ast/expr';
import { OpCode } from '../../bytecode/opcodes';
import { Token, TokenKind } from '../../tokens';

import { chunk } from '../helpers/bytecode';
import type { TestCase } from '../helpers/compiler';

export const VARIABLE_INSTRUCTIONS: TestCase[] = [
  [
    'let i% = 1',
    new Let(
      new Variable(
        new Token({
          kind: TokenKind.IntIdent,
          index: 0,
          row: 1,
          offsetStart: 0,
          offsetEnd: 2,
          text: 'i%',
          value: 'i%',
        }),
      ),
      new IntLiteral(1),
    ),
    chunk({
      constants: ['i%', 1],
      code: [
        OpCode.Constant,
        1,
        OpCode.DefineGlobal,
        0,
        OpCode.Undef,
        OpCode.Return,
      ],
      lines: [100, 100, 100, 100, 100, 100],
    }),
  ],
  [
    'i% = 1',
    new Assign(
      new Variable(
        new Token({
          kind: TokenKind.IntIdent,
          index: 0,
          row: 1,
          offsetStart: 0,
          offsetEnd: 2,
          text: 'i%',
          value: 'i%',
        }),
      ),
      new IntLiteral(1),
    ),
    chunk({
      constants: [1, 'i%'],
      code: [
        OpCode.Constant,
        0,
        OpCode.SetGlobal,
        1,
        OpCode.Undef,
        OpCode.Return,
      ],
      lines: [100, 100, 100, 100, 100, 100],
    }),
  ],
];
