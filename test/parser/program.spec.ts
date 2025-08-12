import { test } from 'vitest';
import { t } from '../helpers/tap';

import { formatter } from '../../format';
import { Source } from '../../ast/source';
import { StringLiteral } from '../../ast/expr';
import { Print } from '../../ast/instr';
import { Line, Program } from '../../ast';
import { throws } from '../helpers/exceptions';
import { FILENAME } from '../helpers/files';
import { parseInput, parseProgram } from '../helpers/parser';

// TODO: This error just says "unexpected token". If we can detect when a
// failed expression is immediately following a line number, we should be able
// to show a better error. The trace is basically:
//
// - successfully parse line number
// - attempt to parse instructions
// - parse the *first* instruction
// - fall through to an expression statement
// - fail to parse a valid expression statement
//
// We would need to track that we just parsed a line number (isLine), that
// we're parsing the very first instruction, and that we're parsing an expression
// statement. That's a boatload of state, but I think it's doable.
test('bare expression starting with an integer', () => {
  throws(() => {
    parseInput('1 * 1');
  });
});

test('simple program', () => {
  const source = ['100 print "hello world"', '200 print "goodbye"'];
  const result = parseProgram(source.join('\n'), FILENAME);

  t.equal(result[1], null);

  t.same(
    result[0],
    new Program(FILENAME, [
      new Line(100, 1, new Source('', '100', ' ', 'print "hello world"'), [
        new Print(new StringLiteral('hello world'), 4, 23),
      ]),
      new Line(200, 2, new Source('', '200', ' ', 'print "goodbye"'), [
        new Print(new StringLiteral('goodbye'), 4, 19),
      ]),
    ]),
  );
});

test('out of order program', () => {
  const source = ['200 print "hello world"', '100 print "goodbye"'];
  const result = parseProgram(source.join('\n'), FILENAME);

  t.matchSnapshot(formatter.format(result[1]));

  t.same(
    result[0],
    new Program(FILENAME, [
      new Line(100, 2, new Source('', '100', ' ', 'print "goodbye"'), [
        new Print(new StringLiteral('goodbye'), 4, 19),
      ]),
      new Line(200, 1, new Source('', '200', ' ', 'print "hello world"'), [
        new Print(new StringLiteral('hello world'), 4, 23),
      ]),
    ]),
  );
});

test('program with non-numbered input', () => {
  throws(() => {
    parseProgram(
      '100 print "hello world"\n"foo"\n200 print "goodbye"',
      FILENAME,
    );
  });
});

test('program with a negative line number', () => {
  throws(() => {
    parseProgram(
      '100 print "hello world"\n-100 "foo"\n200 print "goodbye"',
      FILENAME,
    );
  });
});
