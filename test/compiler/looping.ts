import { Source } from '../../ast/source';
import { Print, While, EndWhile, Repeat, Until } from '../../ast/instr';
import { BoolLiteral, StringLiteral } from '../../ast/expr';
import { Program, Line } from '../../ast';
import { shortToBytes } from '../../bytecode/short';
import { OpCode } from '../../bytecode/opcodes';

import { chunk } from '../helpers/bytecode';
import type { TestCase } from '../helpers/compiler';
import { FILENAME } from '../helpers/files';

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
