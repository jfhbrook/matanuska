import { describe, expect, test } from 'vitest';

import { BaseException } from '../../exceptions';

import { nil, undef, Value } from '../../value';
import { Type } from '../../value/types';
import { typeOf } from '../../value/typeof';

const UNKNOWN = {};

type TestCase = [Value | typeof UNKNOWN, Type];

const CASES: TestCase[] = [
  [true, Type.Boolean],
  [123, Type.Integer],
  [123.456, Type.Real],
  ['hello', Type.String],
  [nil, Type.Nil],
  [undef, Type.Undef],
  [new BaseException('test'), Type.Exception],
  [UNKNOWN, Type.Unknown],
];

describe('typeof', () => {
  for (const [value, type] of CASES) {
    test(`${value} -> ${type}`, () => {
      expect(typeOf(value as Value)).toBe(type);
    });
  }
});
