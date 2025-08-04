import { test } from 'vitest';
import { t } from '../helpers/tap';

import { ParseWarning } from '../../exceptions';
import { formatter } from '../../format';
import { Source } from '../../ast/source';
import { StringLiteral } from '../../ast/expr';
import { Expression } from '../../ast/instr';
import { Cmd, Line, Input } from '../../ast';
import { parseInput } from '../helpers/parser';

test('non-numbered invalid string escape', () => {
  const source = "'\\q'";
  const result = parseInput(source);

  t.type(result[1], ParseWarning);

  const warning = result[1];

  t.same(
    result[0],
    new Input([
      new Cmd(10, 1, Source.command(source), [
        new Expression(new StringLiteral('\\q'), 0, 4),
      ]),
    ]),
  );
  t.matchSnapshot(formatter.format(warning));
});

test('numbered invalid string escape', () => {
  const source = "100 '\\q'";
  const result = parseInput(source);

  t.type(result[1], ParseWarning);

  const warning = result[1];

  t.same(
    result[0],
    new Input([
      new Line(100, 1, new Source('', '100', ' ', "'\\q'"), [
        new Expression(new StringLiteral('\\q'), 4, 8),
      ]),
    ]),
  );
  t.matchSnapshot(formatter.format(warning));
});
