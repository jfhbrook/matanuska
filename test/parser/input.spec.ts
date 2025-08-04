import { test } from 'vitest';
import { t } from '../helpers/tap';

import { Source } from '../../ast/source';
import { StringLiteral } from '../../ast/expr';
import { Print, Expression } from '../../ast/instr';
import { Cmd, Line, Input } from '../../ast';
import { throws } from '../helpers/exceptions';
import { parseInput } from '../helpers/parser';

test('empty input', () => {
  const result = parseInput('');

  t.equal(result[1], null);

  t.same(result[0], new Input([]));
});

test('empty line', () => {
  const source = '100';
  const result = parseInput(source);

  t.equal(result[1], null);

  t.same(
    result[0],
    new Input([new Line(100, 1, new Source('', '100', '', ''), [])]),
  );
});

test('multiple inputs', () => {
  const source = ['100 print "hello world"', '"foo"', '200 print "goodbye"'];
  const result = parseInput(source.join('\n'));

  t.equal(result[1], null);

  t.same(
    result[0],
    new Input([
      new Line(100, 1, new Source('', '100', ' ', 'print "hello world"'), [
        new Print(new StringLiteral('hello world'), 4, 23),
      ]),
      new Cmd(10, 2, Source.command('"foo"'), [
        new Expression(new StringLiteral('foo'), 0, 5),
      ]),
      new Line(200, 3, new Source('', '200', ' ', 'print "goodbye"'), [
        new Print(new StringLiteral('goodbye'), 4, 19),
      ]),
    ]),
  );
});

test('accidentally an entire semicolon', () => {
  throws(() => {
    parseInput('print 1 + 1;');
  });
});
