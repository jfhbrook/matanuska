import { Instr, Print, Exit } from '../../ast/instr';
import {
  Expr,
  Binary,
  Group,
  IntLiteral,
  BoolLiteral,
  StringLiteral,
  NilLiteral,
} from '../../ast/expr';
import { OpCode } from '../../bytecode/opcodes';
import { TokenKind } from '../../tokens';

import { chunk } from '../helpers/bytecode';
import type { TestCase } from '../helpers/compiler';

import { EXPRESSION_STATEMENTS } from './expr';

type InstrCtor<C> = { new <E extends Expr>(expr: E): C };

function instructionExpr1Cases<C extends Instr>(
  name: string,
  instr: InstrCtor<C>,
  code: OpCode,
): TestCase[] {
  return [
    [
      `${name} 225`,
      new instr(new IntLiteral(255)),
      chunk({
        constants: [255],
        code: [OpCode.Constant, 0, code, OpCode.Nil, OpCode.Return],
        lines: [100, 100, 100, 100, 100],
      }),
    ],
    [
      `${name} 123.456`,
      new instr(new IntLiteral(123.456)),
      chunk({
        constants: [123.456],
        code: [OpCode.Constant, 0, code, OpCode.Nil, OpCode.Return],
        lines: [100, 100, 100, 100, 100],
      }),
    ],
    [
      `${name} true`,
      new instr(new BoolLiteral(true)),
      chunk({
        constants: [true],
        code: [OpCode.Constant, 0, code, OpCode.Nil, OpCode.Return],
        lines: [100, 100, 100, 100, 100],
      }),
    ],
    [
      `${name} false`,
      new instr(new BoolLiteral(false)),
      chunk({
        constants: [false],
        code: [OpCode.Constant, 0, code, OpCode.Nil, OpCode.Return],
        lines: [100, 100, 100, 100, 100],
      }),
    ],
    [
      `${name} nil`,
      new instr(new NilLiteral()),
      chunk({
        constants: [],
        code: [OpCode.Nil, code, OpCode.Nil, OpCode.Return],
        lines: [100, 100, 100, 100],
      }),
    ],
    [
      `${name} "hello world"`,
      new instr(new StringLiteral('hello world')),
      chunk({
        constants: ['hello world'],
        code: [OpCode.Constant, 0, code, OpCode.Nil, OpCode.Return],
        lines: [100, 100, 100, 100, 100],
      }),
    ],
    [
      `${name} (1)`,
      new instr(new Group(new IntLiteral(1))),
      chunk({
        constants: [1],
        code: [OpCode.Constant, 0, code, OpCode.Nil, OpCode.Return],
        lines: [100, 100, 100, 100, 100],
      }),
    ],

    [
      `${name} 1 + 1`,
      new instr(
        new Binary(new IntLiteral(1), TokenKind.Plus, new IntLiteral(1)),
      ),
      chunk({
        constants: [1, 1],
        code: [
          OpCode.Constant,
          0,
          OpCode.Constant,
          1,
          OpCode.Add,
          code,
          OpCode.Nil,
          OpCode.Return,
        ],
        lines: [100, 100, 100, 100, 100, 100, 100, 100],
      }),
    ],
  ];
}

// Expressions are handled differently in Programs versus other commands,
// so we leave them off when building out programs from the other commands,
// and append them to COMMANDS afterwards.
export const EXPRESSION_INSTRUCTIONS = EXPRESSION_STATEMENTS.map(
  ([source, ast, { constants, code, lines }]): TestCase => {
    return [
      source,
      ast,
      chunk({
        constants,
        code: code.concat([OpCode.Return]),
        lines: lines.concat([100]),
      }),
    ];
  },
);

export const SIMPLE_INSTRUCTIONS: TestCase[] = [
  ...instructionExpr1Cases('print', Print, OpCode.Print),
  ...instructionExpr1Cases('exit', Exit, OpCode.Exit),
];
