import { Source } from '../../ast/source';
import {
  Print,
  For,
  EndFor,
  While,
  EndWhile,
  Repeat,
  Until,
} from '../../ast/instr';
import {
  BoolLiteral,
  IntLiteral,
  StringLiteral,
  Variable,
} from '../../ast/expr';
import { Program, Line } from '../../ast';
import { shortToBytes } from '../../bytecode/short';
import { OpCode } from '../../bytecode/opcodes';
import { Token, TokenKind } from '../../tokens';

import { chunk } from '../helpers/bytecode';
import type { TestCase } from '../helpers/compiler';
import { FILENAME } from '../helpers/files';

const FOR_VARIABLE = new Variable(
  new Token({
    kind: TokenKind.IntIdent,
    index: 0,
    row: 1,
    offsetStart: 0,
    offsetEnd: 2,
    text: 'i%',
    value: 'i%',
  }),
);

export const FOR_PROGRAMS: TestCase[] = [
  [
    ['10 for i% = 1 to 10', '20   print i%', '30 endfor'].join('\n'),
    new Program(FILENAME, [
      new Line(10, 1, new Source('', '10', ' ', 'for i% = 1 to 10'), [
        new For(FOR_VARIABLE, new IntLiteral(1), new IntLiteral(10), null),
      ]),
      new Line(20, 2, new Source('', '20', '  ', 'print i%'), [
        new Print(FOR_VARIABLE),
      ]),
      new Line(30, 3, new Source('', '30', ' ', 'endfor'), [new EndFor()]),
    ]),

    chunk({
      constants: ['i%', 1, 'i%', 10, 'i%', 'i%', 1, 'i%'],
      code: [
        // Define i%
        OpCode.Constant,
        0,
        OpCode.Constant,
        1,
        OpCode.DefineGlobal,
        0,
        // Loop start
        OpCode.Constant,
        2,
        OpCode.GetGlobal,
        2,
        OpCode.Constant,
        3,
        OpCode.Le,
        // Jump to exit
        OpCode.JumpIfFalse,
        ...shortToBytes(27),
        OpCode.Pop,
        // Jump to body
        OpCode.Jump,
        ...shortToBytes(15),
        // Increment
        OpCode.Constant,
        4,
        OpCode.Constant,
        5,
        OpCode.GetGlobal,
        5,
        OpCode.Constant,
        6,
        OpCode.Add,
        OpCode.SetGlobal,
        OpCode.Pop,
        4,
        // Loop to start
        OpCode.Loop,
        ...shortToBytes(29),
        // Body
        OpCode.Constant,
        7,
        OpCode.GetGlobal,
        7,
        OpCode.Print,
        // Loop to increment
        OpCode.Loop,
        ...shortToBytes(23),
        // Exit
        OpCode.Nil,
        OpCode.Return,
      ],
      lines: [
        10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
        10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 20,
        20, 20, 20, 20, 30, 30, 30, 30, 30,
      ],
    }),
  ],
];

export const WHILE_PROGRAMS: TestCase[] = [
  [
    ['10 while false', '20   print "loop"', '30 endwhile'].join('\n'),
    new Program(FILENAME, [
      new Line(10, 1, new Source('', '10', ' ', 'while false'), [
        new While(new BoolLiteral(false)),
      ]),
      new Line(20, 2, new Source('', '20', '   ', 'print "loop"'), [
        new Print(new StringLiteral('loop')),
      ]),
      new Line(30, 3, new Source('', '30', ' ', 'endwhile'), [new EndWhile()]),
    ]),
    chunk({
      constants: [false, 'loop'],
      code: [
        // Test conditional
        OpCode.Constant,
        0,
        // Jump to exit
        OpCode.JumpIfFalse,
        ...shortToBytes(7),
        // Body
        OpCode.Pop,
        OpCode.Constant,
        1,
        OpCode.Print,
        // Loop to beginning
        OpCode.Loop,
        ...shortToBytes(12),
        // Exit
        OpCode.Nil,
        OpCode.Return,
      ],
      lines: [10, 10, 10, 10, 10, 10, 20, 20, 20, 30, 30, 30, 30, 30],
    }),
  ],
];

export const REPEAT_PROGRAMS: TestCase[] = [
  [
    ['10 repeat', '20   print "loop"', '30 until true'].join('\n'),
    new Program(FILENAME, [
      new Line(10, 1, new Source('', '10', ' ', 'repeat'), [new Repeat()]),
      new Line(20, 2, new Source('', '20', '   ', 'print "loop"'), [
        new Print(new StringLiteral('loop')),
      ]),
      new Line(30, 3, new Source('', '30', ' ', 'until true'), [
        new Until(new BoolLiteral(true)),
      ]),
    ]),
    chunk({
      constants: ['loop', true],
      code: [
        // Body
        OpCode.Constant,
        0,
        OpCode.Print,
        // Test conditional
        OpCode.Constant,
        1,
        // Jump to exit
        OpCode.JumpIfFalse,
        ...shortToBytes(4),
        OpCode.Pop,
        // Loop to beginning
        OpCode.Loop,
        ...shortToBytes(12),
        // Exit
        OpCode.Nil,
        OpCode.Return,
      ],
      lines: [20, 20, 20, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    }),
  ],
];
