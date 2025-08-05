import { describe, test } from 'vitest';
import { t } from '../helpers/tap';

import { Source } from '../../ast/source';
import {
  Variable,
  IntLiteral,
  BoolLiteral,
  StringLiteral,
} from '../../ast/expr';
import {
  Print,
  For,
  Next,
  EndFor,
  While,
  EndWhile,
  Repeat,
  Until,
} from '../../ast/instr';
import { Line, Program } from '../../ast';
import { Token, TokenKind } from '../../tokens';
import { FILENAME } from '../helpers/files';
import { parseProgram } from '../helpers/parser';

describe('for', () => {
  test('without step', () => {
    const source = [
      '10 for i% = 0 to 9',
      '20   print "hello world"',
      '30   next',
      '40 endfor',
    ];
    const result = parseProgram(source.join('\n'), FILENAME);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Program(FILENAME, [
        new Line(10, 1, new Source('', '10', ' ', 'for i% = 0 to 9'), [
          new For(
            new Variable(
              new Token({
                kind: TokenKind.IntIdent,
                index: 7,
                row: 1,
                offsetStart: 7,
                offsetEnd: 9,
                text: 'i%',
                value: 'i%',
              }),
            ),
            new IntLiteral(0),
            new IntLiteral(9),
            null,
            3,
            18,
          ),
        ]),
        new Line(20, 2, new Source('', '20', '   ', 'print "hello world"'), [
          new Print(new StringLiteral('hello world'), 5, 24),
        ]),
        new Line(30, 3, new Source('', '30', '   ', 'next'), [new Next(5, 9)]),
        new Line(40, 4, new Source('', '40', ' ', 'endfor'), [
          new EndFor(3, 9),
        ]),
      ]),
    );
  });

  test('with step', () => {
    const source = [
      '10 for i% = 0 to 9 step 2',
      '20   print "hello world"',
      '30 endfor',
    ];
    const result = parseProgram(source.join('\n'), FILENAME);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Program(FILENAME, [
        new Line(10, 1, new Source('', '10', ' ', 'for i% = 0 to 9 step 2'), [
          new For(
            new Variable(
              new Token({
                kind: TokenKind.IntIdent,
                index: 7,
                row: 1,
                offsetStart: 7,
                offsetEnd: 9,
                text: 'i%',
                value: 'i%',
              }),
            ),
            new IntLiteral(0),
            new IntLiteral(9),
            new IntLiteral(2),
            3,
            25,
          ),
        ]),
        new Line(20, 2, new Source('', '20', '   ', 'print "hello world"'), [
          new Print(new StringLiteral('hello world'), 5, 24),
        ]),
        new Line(30, 3, new Source('', '30', ' ', 'endfor'), [
          new EndFor(3, 9),
        ]),
      ]),
    );
  });
});

test('while', () => {
  const source = ['10 while true', '20   print "true"', '30 endwhile'];
  const result = parseProgram(source.join('\n'), FILENAME);

  t.equal(result[1], null);
  t.same(
    result[0],
    new Program(FILENAME, [
      new Line(10, 1, new Source('', '10', ' ', 'while true'), [
        new While(new BoolLiteral(true), 3, 13),
      ]),
      new Line(20, 2, new Source('', '20', '   ', 'print "true"'), [
        new Print(new StringLiteral('true'), 5, 17),
      ]),
      new Line(30, 3, new Source('', '30', ' ', 'endwhile'), [
        new EndWhile(3, 11),
      ]),
    ]),
  );
});

test('repeat/until', () => {
  const source = ['10 repeat', '20   print "true"', '30 until false'];
  const result = parseProgram(source.join('\n'), FILENAME);

  t.equal(result[1], null);
  t.same(
    result[0],
    new Program(FILENAME, [
      new Line(10, 1, new Source('', '10', ' ', 'repeat'), [new Repeat(3, 9)]),
      new Line(20, 2, new Source('', '20', '   ', 'print "true"'), [
        new Print(new StringLiteral('true'), 5, 17),
      ]),
      new Line(30, 3, new Source('', '30', ' ', 'until false'), [
        new Until(new BoolLiteral(false), 3, 14),
      ]),
    ]),
  );
});
