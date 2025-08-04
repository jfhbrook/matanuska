import { describe, test } from 'vitest';
import { t } from '../helpers/tap';

import { Source } from '../../ast/source';
import { Expression } from '../../ast/instr';
import { Binary, IntLiteral, Unary } from '../../ast/expr';
import { formatter } from '../../format';
import { TokenKind } from '../../tokens';

import { compile } from '../helpers/compiler';

describe('syntax errors', () => {
  test('*1', () => {
    t.plan(2);
    t.throws(() => {
      try {
        compile(
          new Expression(new Unary(TokenKind.Star, new IntLiteral(1)), 0, 2),
          { filename: '<input>', cmdSource: Source.command('*1') },
        );
      } catch (err) {
        t.matchSnapshot(formatter.format(err));
        throw err;
      }
    });
  });

  test('1 $ 1', () => {
    t.plan(2);
    t.throws(() => {
      try {
        compile(
          new Expression(
            new Binary(new IntLiteral(1), TokenKind.Dollar, new IntLiteral(1)),
            0,
            5,
          ),
          { filename: '<input>', cmdSource: Source.command('1 $ 1') },
        );
      } catch (err) {
        t.matchSnapshot(formatter.format(err));
        throw err;
      }
    });
  });
});
