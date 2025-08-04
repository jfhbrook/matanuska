import { describe, test } from 'vitest';
import { t } from '../helpers/tap';

import { Source } from '../../ast/source';
import { IntLiteral } from '../../ast/expr';
import { Exit } from '../../ast/instr';
import { Cmd, Line, Input } from '../../ast';
import { parseInput } from '../helpers/parser';

describe('exit', () => {
  test('non-numbered', () => {
    const source = 'exit 0';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [
          new Exit(new IntLiteral(0), 0, 6),
        ]),
      ]),
    );
  });

  test('numbered', () => {
    const source = '100 exit 0';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new Line(100, 1, new Source('', '100', ' ', 'exit 0'), [
          new Exit(new IntLiteral(0), 4, 10),
        ]),
      ]),
    );
  });

  test('non-numbered, without arguments', () => {
    const source = 'exit';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [new Exit(null, 0, 4)]),
      ]),
    );
  });

  test('numbered, without arguments', () => {
    const source = '100 exit';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new Line(100, 1, new Source('', '100', ' ', 'exit'), [
          new Exit(null, 4, 8),
        ]),
      ]),
    );
  });
});
