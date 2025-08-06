import { describe, test } from 'vitest';
import { t } from '../helpers/tap';

import { Formatter } from '../../format';

export function valuesSuite<F extends Formatter>(formatter: F): void {
  describe(`given a ${formatter.constructor.name}`, () => {
    test('it formats a string', () => {
      t.matchSnapshot(formatter.format('hello'));
    });

    test('it formats a number', () => {
      t.matchSnapshot(formatter.format(12345));
    });

    test('it formats a boolean', () => {
      t.matchSnapshot(formatter.format(true));
    });

    test('it formats a native value', () => {
      t.matchSnapshot(formatter.format(new Set('abc')));
    });

    test('it formats a null value', () => {
      t.matchSnapshot(formatter.format(null));
    });

    test('it formats an undefined value', () => {
      t.matchSnapshot(formatter.format(undefined));
    });

    test('it formats an array of values', () => {
      t.matchSnapshot(formatter.format([1, 'two', true]));
    });
  });
}
