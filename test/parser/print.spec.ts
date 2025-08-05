import { describe, test } from 'vitest';
import { t } from '../helpers/tap';

import { Source } from '../../ast/source';
import { StringLiteral } from '../../ast/expr';
import { Print } from '../../ast/instr';
import { Cmd, Line, Input } from '../../ast';
import { throws } from '../helpers/exceptions';
import { parseInput } from '../helpers/parser';

describe('print', () => {
  test('non-numbered', () => {
    const source = 'print "hello world"';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new Print(new StringLiteral('hello world'), 0, 19),
        ]),
      ]),
    );
  });

  test('numbered', () => {
    const source = '100 print "hello world"';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new Line(100, 1, new Source('', '100', ' ', 'print "hello world"'), [
          new Print(new StringLiteral('hello world'), 4, 23),
        ]),
      ]),
    );
  });

  test('non-numbered, without arguments', () => {
    throws(() => {
      parseInput('print');
    });
  });

  test('numbered, without arguments', () => {
    throws(() => {
      parseInput('100 print');
    });
  });
});
