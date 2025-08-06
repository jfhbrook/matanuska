import { test } from 'vitest';
import { t } from '../helpers/tap';

import { Formatter } from '../../format';

import { Token, TokenKind } from '../../tokens';

export function tokenSuite<F extends Formatter>(formatter: F): void {
  test('it formats a Token', () => {
    t.matchSnapshot(
      formatter.format(
        new Token({
          kind: TokenKind.StringLiteral,
          index: 0,
          row: 0,
          offsetStart: 0,
          offsetEnd: 9,
          text: "'hello\\q'",
          value: 'hello\\q',
        }),
      ),
    );
  });
}
