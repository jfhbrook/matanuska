import { test } from 'vitest';
import { t } from '../helpers/tap';

import { formatter } from '../../format';
import { Source } from '../../ast/source';
import {
  Binary,
  Group,
  Variable,
  IntLiteral,
  RealLiteral,
  BoolLiteral,
  StringLiteral,
  NilLiteral,
} from '../../ast/expr';
import { Instr, Expression } from '../../ast/instr';
import { Cmd, Line, Input } from '../../ast';
import { Token, TokenKind } from '../../tokens';
import { parseInput } from '../helpers/parser';

const EXPRESSIONS: Array<[string, Instr]> = [
  // NOTE: '1' parses as a line number.
  ['0xff', new Expression(new IntLiteral(255), 0, 4)],
  ['0o755', new Expression(new IntLiteral(493), 0, 5)],
  ['0b01', new Expression(new IntLiteral(1), 0, 4)],
  ['123.456', new Expression(new RealLiteral(123.456), 0, 7)],
  ['true', new Expression(new BoolLiteral(true), 0, 4)],
  ['false', new Expression(new BoolLiteral(false), 0, 5)],
  ['nil', new Expression(new NilLiteral(), 0, 3)],
  ['"hello world"', new Expression(new StringLiteral('hello world'), 0, 13)],
  ["'hello world'", new Expression(new StringLiteral('hello world'), 0, 13)],
  [
    '"\\"time machine\\""',
    new Expression(new StringLiteral('"time machine"'), 0, 18),
  ],
  ["'don\\'t'", new Expression(new StringLiteral("don't"), 0, 8)],
  ['(1)', new Expression(new Group(new IntLiteral(1)), 0, 3)],
  [
    '(1 == 1)',
    new Expression(
      new Group(
        new Binary(new IntLiteral(1), TokenKind.EqEq, new IntLiteral(1)),
      ),
      0,
      8,
    ),
  ],
  [
    '(1 <> 1)',
    new Expression(
      new Group(new Binary(new IntLiteral(1), TokenKind.Ne, new IntLiteral(1))),
      0,
      8,
    ),
  ],
];

const WARNED_EXPRESSIONS: Array<[string, Instr]> = [
  [
    '(1 = 1)',
    new Expression(
      new Group(
        new Binary(new IntLiteral(1), TokenKind.EqEq, new IntLiteral(1)),
      ),
      0,
      7,
    ),
  ],
  [
    '(1 != 1)',
    new Expression(
      new Group(new Binary(new IntLiteral(1), TokenKind.Ne, new IntLiteral(1))),
      0,
      8,
    ),
  ],
];

const IDENT_EXPRESSIONS: Array<[string, Expression]> = [
  [
    'i%',
    new Expression(
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
      0,
      2,
    ),
  ],
  [
    'i!',
    new Expression(
      new Variable(
        new Token({
          kind: TokenKind.RealIdent,
          index: 0,
          row: 1,
          offsetStart: 0,
          offsetEnd: 2,
          text: 'i!',
          value: 'i!',
        }),
      ),
      0,
      2,
    ),
  ],
  [
    'i?',
    new Expression(
      new Variable(
        new Token({
          kind: TokenKind.BoolIdent,
          index: 0,
          row: 1,
          offsetStart: 0,
          offsetEnd: 2,
          text: 'i?',
          value: 'i?',
        }),
      ),
      0,
      2,
    ),
  ],
  [
    'i$',
    new Expression(
      new Variable(
        new Token({
          kind: TokenKind.StringIdent,
          index: 0,
          row: 1,
          offsetStart: 0,
          offsetEnd: 2,
          text: 'i$',
          value: 'i$',
        }),
      ),
      0,
      2,
    ),
  ],
];

for (const [source, instr] of EXPRESSIONS) {
  test(`non-numbered expression ${source}`, () => {
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([new Cmd(10, 1, Source.command(source), [instr])]),
    );
  });

  test(`numbered expression ${source}`, () => {
    const result = parseInput(`100 ${source}`);

    t.equal(result[1], null);

    instr.offsetStart += 4;
    instr.offsetEnd += 4;

    t.same(
      result[0],
      new Input([
        new Line(100, 1, new Source('', '100', ' ', source), [instr]),
      ]),
    );

    instr.offsetStart -= 4;
    instr.offsetEnd -= 4;
  });
}

for (const [source, instr] of WARNED_EXPRESSIONS) {
  test(`non-numbered expression ${source}`, () => {
    const result = parseInput(source);

    t.ok(result[1]);
    t.matchSnapshot(formatter.format(result[1]));

    t.same(
      result[0],
      new Input([new Cmd(10, 1, Source.command(source), [instr])]),
    );
  });

  test(`numbered expression ${source}`, () => {
    const result = parseInput(`100 ${source}`);

    t.ok(result[1]);
    t.matchSnapshot(formatter.format(result[1]));

    instr.offsetStart += 4;
    instr.offsetEnd += 4;

    t.same(
      result[0],
      new Input([
        new Line(100, 1, new Source('', '100', ' ', source), [instr]),
      ]),
    );

    instr.offsetStart -= 4;
    instr.offsetEnd -= 4;
  });
}

for (const [source, instr] of IDENT_EXPRESSIONS) {
  test(`non-numbered expression ${source}`, () => {
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([new Cmd(10, 1, Source.command(source), [instr])]),
    );
  });

  test(`numbered expression ${source}`, () => {
    const result = parseInput(`100 ${source}`);

    t.equal(result[1], null);

    instr.offsetStart += 4;
    instr.offsetEnd += 4;
    (instr.expression as any).ident.index += 4;
    (instr.expression as any).ident.offsetStart += 4;
    (instr.expression as any).ident.offsetEnd += 4;

    t.same(
      result[0],
      new Input([
        new Line(100, 1, new Source('', '100', ' ', source), [instr]),
      ]),
    );

    instr.offsetStart -= 4;
    instr.offsetEnd -= 4;
    (instr.expression as any).ident.index -= 4;
    (instr.expression as any).ident.offsetStart -= 4;
    (instr.expression as any).ident.offsetEnd -= 4;
  });
}
