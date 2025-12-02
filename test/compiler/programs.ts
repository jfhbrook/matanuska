import { Source } from '../../ast/source';
import { Instr, Expression } from '../../ast/instr';
import { IntLiteral } from '../../ast/expr';
import { Program, Line } from '../../ast';
import { OpCode } from '../../bytecode/opcodes';
import { RoutineType } from '../../value';

import { routine } from '../helpers/bytecode';
import type { TestCase } from '../helpers/compiler';
import { FILENAME } from '../helpers/files';

import { EXPRESSION_STATEMENTS } from './expr';
import { SIMPLE_INSTRUCTIONS } from './instr';

export const SIMPLE_PROGRAMS: TestCase[] = [
  ...EXPRESSION_STATEMENTS.map(
    ([
      source,
      ast,
      {
        chunk: { constants, code, lines },
      },
    ]): TestCase => {
      return [
        `100 ${source}`,
        new Program(FILENAME, [
          new Line(100, 1, new Source('', '100', ' ', source), [ast as Instr]),
        ]),
        routine({
          type: RoutineType.Program,
          filename: FILENAME,
          constants,
          code: code.concat([OpCode.Pop, OpCode.Undef, OpCode.Return]),
          lines: lines.concat([100, 100, 100]),
        }),
      ];
    },
  ),
  ...SIMPLE_INSTRUCTIONS.map(
    ([
      source,
      ast,
      {
        chunk: { constants, code, lines },
      },
    ]): TestCase => {
      return [
        `100 ${source}`,
        new Program(FILENAME, [
          new Line(100, 1, new Source('', '100', ' ', source), [ast as Instr]),
        ]),
        routine({
          type: RoutineType.Program,
          filename: FILENAME,
          constants,
          code,
          lines,
        }),
      ];
    },
  ),
  [
    '100 1 : 1',
    new Program(FILENAME, [
      new Line(100, 1, new Source('', '100', ' ', '1 : 1'), [
        new Expression(new IntLiteral(1)),
        new Expression(new IntLiteral(255)),
      ]),
    ]),
    routine({
      type: RoutineType.Program,
      filename: FILENAME,
      constants: [1, 255],
      code: [
        OpCode.Constant,
        0,
        OpCode.Pop,
        OpCode.Constant,
        1,
        OpCode.Pop,
        OpCode.Undef,
        OpCode.Return,
      ],
      lines: [100, 100, 100, 100, 100, 100, 100, 100],
    }),
  ],
];
