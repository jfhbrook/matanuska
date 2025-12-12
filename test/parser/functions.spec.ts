import { describe, test } from 'vitest';
import { t } from '../helpers/tap';

import { Source } from '../../ast/source';
import { StringLiteral } from '../../ast/expr';
import { Def, ShortDef, Return, EndDef, Print, Let } from '../../ast/instr';
import { Binary, Lambda, Variable, IntLiteral } from '../../ast/expr';
import { Cmd, Line, Input, Program } from '../../ast';
import { Token, TokenKind } from '../../tokens';
import { FILENAME } from '../helpers/files';
import { parseInput, parseProgram } from '../helpers/parser';

describe('short def', () => {
  test('without optional return', () => {
    const source = 'def foo(a%, b%) a% + b% enddef';
    const result = parseInput(source);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new ShortDef(
            new Token({
              kind: TokenKind.Ident,
              index: 4,
              row: 1,
              offsetStart: 4,
              offsetEnd: 7,
              text: 'foo',
              value: 'foo',
            }),
            [
              new Token({
                kind: TokenKind.IntIdent,
                index: 8,
                row: 1,
                offsetStart: 8,
                offsetEnd: 10,
                text: 'a%',
                value: 'a%',
              }),
              new Token({
                kind: TokenKind.IntIdent,
                index: 12,
                row: 1,
                offsetStart: 12,
                offsetEnd: 14,
                text: 'b%',
                value: 'b%',
              }),
            ],
            new Binary(
              new Variable(
                new Token({
                  kind: TokenKind.IntIdent,
                  index: 16,
                  row: 1,
                  offsetStart: 16,
                  offsetEnd: 18,
                  text: 'a%',
                  value: 'a%',
                }),
              ),
              TokenKind.Plus,
              new Variable(
                new Token({
                  kind: TokenKind.IntIdent,
                  index: 21,
                  row: 1,
                  offsetStart: 21,
                  offsetEnd: 23,
                  text: 'b%',
                  value: 'b%',
                }),
              ),
            ),
            0,
            30,
          ),
        ]),
      ]),
    );
  });

  test('with optional return', () => {
    const source = 'def foo(a%, b%) return a% + b% enddef';
    const result = parseInput(source);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new ShortDef(
            new Token({
              kind: TokenKind.Ident,
              index: 4,
              row: 1,
              offsetStart: 4,
              offsetEnd: 7,
              text: 'foo',
              value: 'foo',
            }),
            [
              new Token({
                kind: TokenKind.IntIdent,
                index: 8,
                row: 1,
                offsetStart: 8,
                offsetEnd: 10,
                text: 'a%',
                value: 'a%',
              }),
              new Token({
                kind: TokenKind.IntIdent,
                index: 12,
                row: 1,
                offsetStart: 12,
                offsetEnd: 14,
                text: 'b%',
                value: 'b%',
              }),
            ],
            new Binary(
              new Variable(
                new Token({
                  kind: TokenKind.IntIdent,
                  index: 23,
                  row: 1,
                  offsetStart: 23,
                  offsetEnd: 25,
                  text: 'a%',
                  value: 'a%',
                }),
              ),
              TokenKind.Plus,
              new Variable(
                new Token({
                  kind: TokenKind.IntIdent,
                  index: 28,
                  row: 1,
                  offsetStart: 28,
                  offsetEnd: 30,
                  text: 'b%',
                  value: 'b%',
                }),
              ),
            ),
            0,
            37,
          ),
        ]),
      ]),
    );
  });
});

test('long def', () => {
  const source = [
    '100 def foo()',
    '110   print "true"',
    '120   return 2',
    '130 enddef',
  ];
  const result = parseProgram(source.join('\n'), FILENAME);

  t.equal(result[1], null);
  t.same(
    result[0],
    new Program(FILENAME, [
      new Line(100, 1, new Source('', '100', ' ', 'def foo()'), [
        new Def(
          new Token({
            kind: TokenKind.Ident,
            index: 8,
            row: 1,
            offsetStart: 8,
            offsetEnd: 11,
            text: 'foo',
            value: 'foo',
          }),
          [],
          4,
          13,
        ),
      ]),
      new Line(110, 2, new Source('', '110', '   ', 'print "true"'), [
        new Print(new StringLiteral('true'), 6, 18),
      ]),
      new Line(120, 3, new Source('', '120', '   ', 'return 2'), [
        new Return(new IntLiteral(2), 6, 14),
      ]),
      new Line(130, 4, new Source('', '130', ' ', 'enddef'), [
        new EndDef(4, 10),
      ]),
    ]),
  );
});

describe('lambda', () => {
  test('without optional return', () => {
    const source = 'let foo = def(a%, b%) a% + b% enddef';
    const result = parseInput(source);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new Let(
            new Variable(
              new Token({
                kind: TokenKind.Ident,
                index: 4,
                row: 1,
                offsetStart: 4,
                offsetEnd: 7,
                text: 'foo',
                value: 'foo',
              }),
            ),
            new Lambda(
              null,
              [
                new Token({
                  kind: TokenKind.IntIdent,
                  index: 14,
                  row: 1,
                  offsetStart: 14,
                  offsetEnd: 16,
                  text: 'a%',
                  value: 'a%',
                }),
                new Token({
                  kind: TokenKind.IntIdent,
                  index: 18,
                  row: 1,
                  offsetStart: 18,
                  offsetEnd: 20,
                  text: 'b%',
                  value: 'b%',
                }),
              ],
              new Binary(
                new Variable(
                  new Token({
                    kind: TokenKind.IntIdent,
                    index: 22,
                    row: 1,
                    offsetStart: 22,
                    offsetEnd: 24,
                    text: 'a%',
                    value: 'a%',
                  }),
                ),
                TokenKind.Plus,
                new Variable(
                  new Token({
                    kind: TokenKind.IntIdent,
                    index: 27,
                    row: 1,
                    offsetStart: 27,
                    offsetEnd: 29,
                    text: 'b%',
                    value: 'b%',
                  }),
                ),
              ),
            ),
            0,
            36,
          ),
        ]),
      ]),
    );
  });
});
