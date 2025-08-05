import { describe, test } from 'vitest';
import { t } from '../helpers/tap';

import { Source } from '../../ast/source';
import { IntLiteral } from '../../ast/expr';
import { Print, Rem } from '../../ast/instr';
import { Cmd, Input } from '../../ast';
import { parseInput } from '../helpers/parser';

describe('remarks', () => {
  test('bare remark', () => {
    const source = 'rem this is a comment';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new Rem('this is a comment', 0, 21),
        ]),
      ]),
    );
  });

  test('bare, empty remark', () => {
    const source = 'rem';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([new Cmd(10, 1, Source.command(source), [new Rem('', 0, 3)])]),
    );
  });

  test('bare semicolon', () => {
    const source = ';';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([new Cmd(10, 1, Source.command(source), [new Rem('', 0, 1)])]),
    );
  });

  test('remark following a instruction', () => {
    const source = 'print 1 rem this is a comment';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new Print(new IntLiteral(1), 0, 7),
          new Rem('this is a comment', 8, 29),
        ]),
      ]),
    );
  });

  test('remark as a second instruction', () => {
    const source = 'print 1 : rem this is a comment';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new Print(new IntLiteral(1), 0, 7),
          new Rem('this is a comment', 10, 31),
        ]),
      ]),
    );
  });
});
