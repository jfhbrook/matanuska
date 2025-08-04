import { describe, test } from 'vitest';
import { t } from '../helpers/tap';

import { Source } from '../../ast/source';
import { BoolLiteral, StringLiteral } from '../../ast/expr';
import { Print, ShortIf, If, Else, ElseIf, EndIf } from '../../ast/instr';
import { Cmd, Line, Input, Program } from '../../ast';
import { FILENAME } from '../helpers/files';
import { parseInput, parseProgram } from '../helpers/parser';

describe('short if', () => {
  test('full short if', () => {
    const source = 'if true then print "true" else print "false" endif';
    const result = parseInput(source);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new ShortIf(
            new BoolLiteral(true),
            [new Print(new StringLiteral('true'), 13, 25)],
            [new Print(new StringLiteral('false'), 31, 44)],
            0,
            50,
          ),
        ]),
      ]),
    );
  });

  test('no-else short if', () => {
    const source = 'if true then print "true" endif';
    const result = parseInput(source);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new ShortIf(
            new BoolLiteral(true),
            [new Print(new StringLiteral('true'), 13, 25)],
            [],
            0,
            31,
          ),
        ]),
      ]),
    );
  });

  test('nested then/if in short if', () => {
    const source =
      'if true then if false then print "true and false" endif else print "false" endif';
    const result = parseInput(source);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new ShortIf(
            new BoolLiteral(true),
            [
              new ShortIf(
                new BoolLiteral(false),
                [new Print(new StringLiteral('true and false'), 27, 49)],
                [],
                13,
                55,
              ),
            ],
            [new Print(new StringLiteral('false'), 61, 74)],
            0,
            80,
          ),
        ]),
      ]),
    );
  });

  test('nested else/if in short if', () => {
    const source =
      'if true then print "true" else if false then print "false and false" endif endif';
    const result = parseInput(source);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new ShortIf(
            new BoolLiteral(true),
            [new Print(new StringLiteral('true'), 13, 25)],
            [
              new ShortIf(
                new BoolLiteral(false),
                [new Print(new StringLiteral('false and false'), 45, 68)],
                [],
                31,
                74,
              ),
            ],
            0,
            80,
          ),
        ]),
      ]),
    );
  });
});

describe('long if', () => {
  test('if/endif', () => {
    const source = ['10 if true then', '20   print "true"', '30 endif'];
    const result = parseProgram(source.join('\n'), FILENAME);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Program(FILENAME, [
        new Line(10, 1, new Source('', '10', ' ', 'if true then'), [
          new If(new BoolLiteral(true), 3, 15),
        ]),
        new Line(20, 2, new Source('', '20', '   ', 'print "true"'), [
          new Print(new StringLiteral('true'), 5, 17),
        ]),
        new Line(30, 3, new Source('', '30', ' ', 'endif'), [new EndIf(3, 8)]),
      ]),
    );
  });

  test('if/else/endif', () => {
    const source = [
      '10 if true then',
      '20   print "true"',
      '30 else',
      '40   print "false"',
      '50 endif',
    ];
    const result = parseProgram(source.join('\n'), FILENAME);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Program(FILENAME, [
        new Line(10, 1, new Source('', '10', ' ', 'if true then'), [
          new If(new BoolLiteral(true), 3, 15),
        ]),
        new Line(20, 2, new Source('', '20', '   ', 'print "true"'), [
          new Print(new StringLiteral('true'), 5, 17),
        ]),
        new Line(30, 3, new Source('', '30', ' ', 'else'), [new Else(3, 7)]),
        new Line(40, 4, new Source('', '40', '   ', 'print "false"'), [
          new Print(new StringLiteral('false'), 5, 18),
        ]),
        new Line(50, 5, new Source('', '50', ' ', 'endif'), [new EndIf(3, 8)]),
      ]),
    );
  });

  test('if/elseif/endif', () => {
    const source = [
      '10 if true then',
      '20   print "true"',
      '30 else if false then',
      '40   print "false"',
      '50 endif',
    ];
    const result = parseProgram(source.join('\n'), FILENAME);

    t.equal(result[1], null);
    t.same(
      result[0],
      new Program(FILENAME, [
        new Line(10, 1, new Source('', '10', ' ', 'if true then'), [
          new If(new BoolLiteral(true), 3, 15),
        ]),
        new Line(20, 2, new Source('', '20', '   ', 'print "true"'), [
          new Print(new StringLiteral('true'), 5, 17),
        ]),
        new Line(30, 3, new Source('', '30', ' ', 'else if false then'), [
          new ElseIf(new BoolLiteral(false), 3, 21),
        ]),
        new Line(40, 4, new Source('', '40', '   ', 'print "false"'), [
          new Print(new StringLiteral('false'), 5, 18),
        ]),
        new Line(50, 5, new Source('', '50', ' ', 'endif'), [new EndIf(3, 8)]),
      ]),
    );
  });
});
