import { describe, expect, test } from 'vitest';

import { BaseException, TypeError } from '../../exceptions';
import { BaseFault, RuntimeFault } from '../../faults';
import { formatter } from '../../format';
import { nil, undef, Value } from '../../value';
import { Type } from '../../value/types';
import { cast, castType } from '../../value/cast';

const EXCEPTION = new BaseException('test exception');

type TestCase = [Value, Type, Type, any];

const CASES: TestCase[] = [
  [123, Type.Integer, Type.Integer, 123],
  [123, Type.Integer, Type.Real, 123],
  [123, Type.Integer, Type.Boolean, true],
  [0, Type.Integer, Type.Boolean, false],
  [123, Type.Integer, Type.String, TypeError],
  [123, Type.Integer, Type.Exception, TypeError],
  [123, Type.Integer, Type.Nil, TypeError],
  [123, Type.Integer, Type.Any, RuntimeFault],

  [123.456, Type.Real, Type.Integer, 123],
  [123.456, Type.Real, Type.Real, 123.456],
  [123.456, Type.Real, Type.Boolean, true],
  [0.0, Type.Real, Type.Boolean, false],
  [123.456, Type.Real, Type.String, TypeError],
  [123.456, Type.Real, Type.Exception, TypeError],
  [123.456, Type.Real, Type.Nil, TypeError],
  [123.456, Type.Real, Type.Any, RuntimeFault],

  [true, Type.Boolean, Type.Integer, 1],
  [true, Type.Boolean, Type.Real, 1.0],
  [true, Type.Boolean, Type.Boolean, true],
  [true, Type.Boolean, Type.String, TypeError],
  [true, Type.Boolean, Type.Exception, TypeError],
  [true, Type.Boolean, Type.Nil, TypeError],
  [true, Type.Boolean, Type.Any, RuntimeFault],

  ['hello', Type.String, Type.Integer, TypeError],
  ['hello', Type.String, Type.Real, TypeError],
  ['hello', Type.String, Type.Boolean, true],
  ['', Type.String, Type.Boolean, false],
  ['hello', Type.String, Type.String, 'hello'],
  ['hello', Type.String, Type.Exception, TypeError],
  ['hello', Type.String, Type.Nil, TypeError],
  ['hello', Type.String, Type.Any, RuntimeFault],

  [EXCEPTION, Type.Exception, Type.Integer, TypeError],
  [EXCEPTION, Type.Exception, Type.Real, TypeError],
  [EXCEPTION, Type.Exception, Type.Boolean, true],
  [EXCEPTION, Type.Exception, Type.String, TypeError],
  [EXCEPTION, Type.Exception, Type.Exception, EXCEPTION],
  [EXCEPTION, Type.Exception, Type.Nil, TypeError],
  [EXCEPTION, Type.Exception, Type.Any, RuntimeFault],

  [nil, Type.Nil, Type.Integer, TypeError],
  [nil, Type.Nil, Type.Real, TypeError],
  [nil, Type.Nil, Type.Boolean, false],
  [nil, Type.Nil, Type.String, TypeError],
  [nil, Type.Nil, Type.Exception, TypeError],
  [nil, Type.Nil, Type.Nil, nil],
  [nil, Type.Nil, Type.Any, RuntimeFault],

  [undef, Type.Undef, Type.Integer, TypeError],
  [undef, Type.Undef, Type.Real, TypeError],
  [undef, Type.Undef, Type.Boolean, false],
  [undef, Type.Undef, Type.String, TypeError],
  [undef, Type.Undef, Type.Exception, TypeError],
  [undef, Type.Undef, Type.Nil, nil],
  [undef, Type.Undef, Type.Any, RuntimeFault],
];

function testCast([value, from_, to_, expected]: TestCase): void {
  const proto = (expected as any).prototype;
  const isError = proto instanceof BaseException || proto instanceof BaseFault;

  if (isError) {
    test(`cast(${formatter.format(value)}, ${from_}, ${to_}) throws a ${proto.name}`, () => {
      expect(() => cast(value, from_, to_)).toThrowError(expected);
    });
  } else {
    test(`cast(${formatter.format(value)}, ${from_}, ${to_}) -> ${expected}`, () => {
      expect(cast(value, from_, to_)).toEqual(expected);
    });
  }

  if (from_ === Type.Any || to_ === Type.Any) {
    test(`castType(${from_}, ${to_}) -> any`, () => {
      expect(castType(from_, to_)).toBe(Type.Any);
    });
  } else if (isError) {
    test(`castType(${from_}, ${to_}) -> invalid`, () => {
      expect(castType(from_, to_)).toBe(Type.Invalid);
    });
  } else {
    test(`castType(${from_}, ${to_}) -> ${to_}`, () => {
      expect(castType(from_, to_)).toBe(to_);
    });
  }
}

function testCastFromAny([value, _, to_, expected]: TestCase): void {
  return testCast([value, Type.Any, to_, expected]);
}

describe('cast', () => {
  for (const case_ of CASES) {
    testCast(case_);
  }

  for (const case_ of CASES) {
    testCastFromAny(case_);
  }
});
