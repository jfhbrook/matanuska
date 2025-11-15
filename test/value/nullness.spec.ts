import { describe, expect, test } from 'vitest';

import { BaseException } from '../../exceptions';

import { nil, undef, Value } from '../../value';
import { Type } from '../../value/types';
import { typeOf } from '../../value/typeof';
import { nullish } from '../../value/nullness';

type TestCase = [Value, boolean];

const CASES: TestCase[] = [
  [true, false],
  [false, false],
  [123, false],
  [0, false],
  [123.456, false],
  [0.0, false],
  ['hello', false],
  ['', false],
  [nil, true],
  [undef, true],
  [new BaseException('test'), false],
];

describe('nullish', () => {
  test('when the type is known', () => {
    for (const [value, isNullish] of CASES) {
      const type = typeOf(value);
      expect(nullish(value, type), `${value} is nullish`).toBe(isNullish);
    }
  });

  test('when the type is unknown', () => {
    for (const [value, isNullish] of CASES) {
      expect(nullish(value, Type.Any), `${value} is nullish`).toBe(isNullish);
    }
  });
});
