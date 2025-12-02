import { Source } from '../../ast/source';
import { Print, ShortIf, If, Else, ElseIf, EndIf } from '../../ast/instr';
import { BoolLiteral, StringLiteral } from '../../ast/expr';
import { Program, Line } from '../../ast';
import { shortToBytes } from '../../bytecode/short';
import { OpCode } from '../../bytecode/opcodes';
import { RoutineType } from '../../value';

import { routine } from '../helpers/bytecode';
import type { TestCase } from '../helpers/compiler';
import { FILENAME } from '../helpers/files';

export const CONDITIONAL_INSTRUCTIONS: TestCase[] = [
  [
    'if true then print "true" else print "false" endif',
    new ShortIf(
      new BoolLiteral(true),
      [new Print(new StringLiteral('true'))],
      [new Print(new StringLiteral('false'))],
    ),
    routine({
      constants: [true, 'true', 'false'],
      code: [
        OpCode.Constant,
        0,
        // Jump to "else"
        OpCode.JumpIfFalse,
        ...shortToBytes(7),
        // "then" block
        OpCode.Pop,
        OpCode.Constant,
        1,
        OpCode.Print,
        // Jump to end
        OpCode.Jump,
        ...shortToBytes(4),
        // "else" block
        OpCode.Pop,
        OpCode.Constant,
        2,
        OpCode.Print,
        OpCode.Undef,
        OpCode.Return,
      ],
      lines: [
        100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
        100, 100, 100, 100,
      ],
    }),
  ],
];

export const CONDITIONAL_PROGRAMS: TestCase[] = [
  [
    [
      '10 if true then',
      '20   print "true"',
      '30 else',
      '40   print "false"',
      '50 endif',
    ].join('\n'),
    new Program(FILENAME, [
      new Line(10, 1, new Source('', '10', ' ', 'if true then'), [
        new If(new BoolLiteral(true)),
      ]),
      new Line(20, 2, new Source('', '20', '   ', 'print "true"'), [
        new Print(new StringLiteral('true')),
      ]),
      new Line(30, 3, new Source('', '30', ' ', 'else'), [new Else()]),
      new Line(40, 4, new Source('', '40', '   ', 'print "false"'), [
        new Print(new StringLiteral('false')),
      ]),
      new Line(50, 5, new Source('', '50', ' ', 'endif'), [new EndIf()]),
    ]),
    routine({
      type: RoutineType.Program,
      filename: FILENAME,
      constants: [true, 'true', 'false'],
      code: [
        OpCode.Constant,
        0,
        // Jump to "else"
        OpCode.JumpIfFalse,
        ...shortToBytes(7),
        // "then" block
        OpCode.Pop,
        OpCode.Constant,
        1,
        OpCode.Print,
        // Jump to end
        OpCode.Jump,
        ...shortToBytes(4),
        // "else" block
        OpCode.Pop,
        OpCode.Constant,
        2,
        OpCode.Print,
        OpCode.Undef,
        OpCode.Return,
      ],
      lines: [
        10, 10, 10, 10, 10, 10, 20, 20, 20, 30, 30, 30, 30, 40, 40, 40, 50, 50,
      ],
    }),
  ],
  [
    [
      '10 if true then',
      '20   print "true"',
      '30 else if false then',
      '40   print "false"',
      '50 endif',
    ].join('\n'),
    new Program(FILENAME, [
      new Line(10, 1, new Source('', '10', ' ', 'if true then'), [
        new If(new BoolLiteral(true)),
      ]),
      new Line(20, 2, new Source('', '20', '   ', 'print "true"'), [
        new Print(new StringLiteral('true')),
      ]),
      new Line(30, 3, new Source('', '30', ' ', 'else if false then'), [
        new ElseIf(new BoolLiteral(false)),
      ]),
      new Line(40, 4, new Source('', '40', '   ', 'print "false"'), [
        new Print(new StringLiteral('false')),
      ]),
      new Line(50, 5, new Source('', '50', ' ', 'endif'), [new EndIf()]),
    ]),
    routine({
      type: RoutineType.Program,
      filename: FILENAME,
      constants: [true, 'true', false, 'false'],
      code: [
        OpCode.Constant,
        0,
        // Jump to "else if"
        OpCode.JumpIfFalse,
        ...shortToBytes(7),
        // outer "then" block
        OpCode.Pop,
        OpCode.Constant,
        1,
        OpCode.Print,
        // Jump to end
        OpCode.Jump,
        ...shortToBytes(14),
        // "else if" block
        OpCode.Pop,
        OpCode.Constant,
        2,
        // Jump to inner implicit "else"
        OpCode.JumpIfFalse,
        ...shortToBytes(7),
        // inner "then" block"
        OpCode.Pop,
        OpCode.Constant,
        3,
        OpCode.Print,
        // Jump to outer implicit "else"
        OpCode.Jump,
        ...shortToBytes(1),
        // "else" block
        OpCode.Pop,
        OpCode.Undef,
        OpCode.Return,
      ],
      lines: [
        10, 10, 10, 10, 10, 10, 20, 20, 20, 30, 30, 30, 30, 30, 30, 30, 30, 30,
        30, 40, 40, 40, 50, 50, 50, 50, 50, 50,
      ],
    }),
  ],
];
