import { describe, test } from 'vitest';
import { t } from '../helpers/tap';

import { Source } from '../../ast/source';
import { List } from '../../ast/instr';
import { Cmd, Input } from '../../ast';
import { parseInput } from '../helpers/parser';

describe('list', () => {
  test('no range', () => {
    const source = 'list';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [new List(null, null, 0, 4)]),
      ]),
    );
  });

  test('line number', () => {
    const source = 'list 10';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [new List(10, null, 0, 7)]),
      ]),
    );
  });

  test('full range', () => {
    const source = 'list 10-20';
    const result = parseInput(source);

    t.equal(result[1], null);

    t.same(
      result[0],
      new Input([
        new Cmd(10, 1, Source.command(source), [new List(10, 20, 0, 10)]),
      ]),
    );
  });
});
