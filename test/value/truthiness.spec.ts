import { describe, expect, test } from 'vitest';

import { BaseException } from '../../exceptions';

import { nil, undef, Value } from '../../value';
import { Type } from '../../value/types';
import { typeOf } from '../../value/typeof';
import { truthy, falsey } from '../../value/truthiness';

type TestCase = [Value, boolean];

const CASES: TestCase[] = [
  [true, true],
  [false, false],
  [123, true],
  [0, false],
  [123.456, true],
  [0.0, false],
  ['hello', true],
  ['', false],
  [nil, false],
  [undef, false],
  [new BaseException('test'), true],
];

describe('truthy', () => {
  test('when the type is known', () => {
    for (const [value, isTruthy] of CASES) {
      const type = typeOf(value);
      expect(truthy(value, type), `${value} is truthy`).toBe(isTruthy);
    }
  });

  test('when the type is unknown', () => {
    for (const [value, isTruthy] of CASES) {
      expect(truthy(value, Type.Any), `${value} is truthy`).toBe(isTruthy);
    }
  });
});

describe('falsey', () => {
  test('when the type is known', () => {
    for (const [value, isTruthy] of CASES) {
      const type = typeOf(value);
      expect(falsey(value, type), `${value} is falsey`).toBe(!isTruthy);
    }
  });

  test('when the type is unknown', () => {
    for (const [value, isTruthy] of CASES) {
      expect(falsey(value, Type.Any), `${value} is falsey`).toBe(!isTruthy);
    }
  });
});
