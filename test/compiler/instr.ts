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

import { routine } from '../helpers/bytecode';
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
      routine({
        constants: [255],
        code: [OpCode.Constant, 0, code, OpCode.Undef, OpCode.Return],
        lines: [100, 100, 100, 100, 100],
      }),
    ],
    [
      `${name} 123.456`,
      new instr(new IntLiteral(123.456)),
      routine({
        constants: [123.456],
        code: [OpCode.Constant, 0, code, OpCode.Undef, OpCode.Return],
        lines: [100, 100, 100, 100, 100],
      }),
    ],
    [
      `${name} true`,
      new instr(new BoolLiteral(true)),
      routine({
        constants: [true],
        code: [OpCode.Constant, 0, code, OpCode.Undef, OpCode.Return],
        lines: [100, 100, 100, 100, 100],
      }),
    ],
    [
      `${name} false`,
      new instr(new BoolLiteral(false)),
      routine({
        constants: [false],
        code: [OpCode.Constant, 0, code, OpCode.Undef, OpCode.Return],
        lines: [100, 100, 100, 100, 100],
      }),
    ],
    [
      `${name} nil`,
      new instr(new NilLiteral()),
      routine({
        constants: [],
        code: [OpCode.Nil, code, OpCode.Undef, OpCode.Return],
        lines: [100, 100, 100, 100],
      }),
    ],
    [
      `${name} "hello world"`,
      new instr(new StringLiteral('hello world')),
      routine({
        constants: ['hello world'],
        code: [OpCode.Constant, 0, code, OpCode.Undef, OpCode.Return],
        lines: [100, 100, 100, 100, 100],
      }),
    ],
    [
      `${name} (1)`,
      new instr(new Group(new IntLiteral(1))),
      routine({
        constants: [1],
        code: [OpCode.Constant, 0, code, OpCode.Undef, OpCode.Return],
        lines: [100, 100, 100, 100, 100],
      }),
    ],

    [
      `${name} 1 + 1`,
      new instr(
        new Binary(new IntLiteral(1), TokenKind.Plus, new IntLiteral(1)),
      ),
      routine({
        constants: [1, 1],
        code: [
          OpCode.Constant,
          0,
          OpCode.Constant,
          1,
          OpCode.Add,
          code,
          OpCode.Undef,
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
export const EXPRESSION_INSTRUCTIONS = (EXPRESSION_STATEMENTS as any).map(
  ([
    source,
    ast,
    {
      chunk: { constants, code, lines },
    },
  ]): TestCase => {
    return [
      source,
      ast,
      routine({
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
