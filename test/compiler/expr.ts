import { Expression } from '../../ast/instr';
import {
  Binary,
  Logical,
  Group,
  Variable,
  IntLiteral,
  RealLiteral,
  BoolLiteral,
  StringLiteral,
  Unary,
  NilLiteral,
} from '../../ast/expr';
import { OpCode } from '../../bytecode/opcodes';
import { shortToBytes } from '../../bytecode/short';
import { Token, TokenKind } from '../../tokens';

import { routine } from '../helpers/bytecode';
import type { TestCase } from '../helpers/compiler';

export const EXPRESSION_STATEMENTS: TestCase[] = [
  [
    '255',
    new Expression(new IntLiteral(255)),
    routine({
      constants: [255],
      code: [OpCode.Constant, 0],
      lines: [100, 100],
    }),
  ],
  [
    '123.456',
    new Expression(new RealLiteral(123.456)),
    routine({
      constants: [123.456],
      code: [OpCode.Constant, 0],
      lines: [100, 100],
    }),
  ],
  [
    'true',
    new Expression(new BoolLiteral(true)),
    routine({
      constants: [true],
      code: [OpCode.Constant, 0],
      lines: [100, 100],
    }),
  ],
  [
    'false',
    new Expression(new BoolLiteral(false)),
    routine({
      constants: [false],
      code: [OpCode.Constant, 0],
      lines: [100, 100],
    }),
  ],
  [
    'nil',
    new Expression(new NilLiteral()),
    routine({
      constants: [],
      code: [OpCode.Nil],
      lines: [100],
    }),
  ],
  [
    '"hello world"',
    new Expression(new StringLiteral('hello world')),
    routine({
      constants: ['hello world'],
      code: [OpCode.Constant, 0],
      lines: [100, 100],
    }),
  ],
  [
    '(1)',
    new Expression(new Group(new IntLiteral(1))),
    routine({
      constants: [1],
      code: [OpCode.Constant, 0],
      lines: [100, 100],
    }),
  ],

  [
    '1 + 1',
    new Expression(
      new Binary(new IntLiteral(1), TokenKind.Plus, new IntLiteral(1)),
    ),
    routine({
      constants: [1, 1],
      code: [OpCode.Constant, 0, OpCode.Constant, 1, OpCode.Add],
      lines: [100, 100, 100, 100, 100],
    }),
  ],

  [
    'true and false',
    new Expression(
      new Logical(new BoolLiteral(true), TokenKind.And, new BoolLiteral(false)),
    ),
    routine({
      constants: [true, false],
      code: [
        OpCode.Constant,
        0,
        OpCode.JumpIfFalse,
        ...shortToBytes(3),
        OpCode.Pop,
        OpCode.Constant,
        1,
      ],
      lines: [100, 100, 100, 100, 100, 100, 100, 100],
    }),
  ],

  [
    'true or false',
    new Expression(
      new Logical(new BoolLiteral(true), TokenKind.Or, new BoolLiteral(false)),
    ),
    routine({
      constants: [true, false],
      code: [
        OpCode.Constant,
        0,
        OpCode.JumpIfFalse,
        ...shortToBytes(3),
        OpCode.Jump,
        ...shortToBytes(3),
        OpCode.Pop,
        OpCode.Constant,
        1,
      ],
      lines: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
    }),
  ],

  [
    '-1',
    new Expression(new Unary(TokenKind.Minus, new IntLiteral(1))),
    routine({
      constants: [1],
      code: [OpCode.Constant, 0, OpCode.Neg],
      lines: [100, 100, 100],
    }),
  ],

  [
    '+1',
    new Expression(new Unary(TokenKind.Plus, new IntLiteral(1))),
    routine({
      constants: [1],
      code: [OpCode.Constant, 0],
      lines: [100, 100],
    }),
  ],

  [
    'i% + 1',
    new Expression(
      new Binary(
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
        TokenKind.Plus,
        new IntLiteral(1),
      ),
    ),
    routine({
      constants: ['i%', 1],
      code: [OpCode.GetGlobal, 0, OpCode.Constant, 1, OpCode.Add],
      lines: [100, 100, 100, 100, 100],
    }),
  ],
];
