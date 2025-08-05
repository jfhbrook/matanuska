import { test } from 'vitest';
import { t } from '../helpers/tap';

import { Source } from '../../ast/source';
import { Variable, IntLiteral } from '../../ast/expr';
import { Let, Assign } from '../../ast/instr';
import { Cmd, Input } from '../../ast';
import { Token, TokenKind } from '../../tokens';
import { parseInput } from '../helpers/parser';

test('let', () => {
  const source = 'let i% = 1';
  const result = parseInput(source);

  t.equal(result[1], null);
  t.same(
    result[0],
    new Input([
      new Cmd(10, 1, Source.command(source), [
        new Let(
          new Variable(
            new Token({
              kind: TokenKind.IntIdent,
              index: 4,
              row: 1,
              offsetStart: 4,
              offsetEnd: 6,
              text: 'i%',
              value: 'i%',
            }),
          ),
          new IntLiteral(1),
          0,
          10,
        ),
      ]),
    ]),
  );
});

test('assign', () => {
  const source = 'i% = 1';
  const result = parseInput(source);

  t.equal(result[1], null);
  t.same(
    result[0],
    new Input([
      new Cmd(10, 1, Source.command(source), [
        new Assign(
          new Variable(
            new Token({
              kind: TokenKind.IntIdent,
              index: 0,
              row: 1,
              offsetStart: 0,
              offsetEnd: 2,
              text: 'i%',
              value: 'i%',
            }),
          ),
          new IntLiteral(1),
          0,
          6,
        ),
      ]),
    ]),
  );
});
