import { describe, expect, test } from 'vitest';

import { BaseException, TypeError } from '../../exceptions';
import { BaseFault, NotImplementedFault, RuntimeFault } from '../../faults';
import { formatter } from '../../format';
import { nil, undef, Value } from '../../value';
import { Type } from '../../value/types';
import { into, intoType } from '../../value/convert';
import { truthy } from '../../value/truthiness';

const EXCEPTION = new BaseException('test exception');

type TestCase = [Value, Type, Type, any];

const CASES: TestCase[] = [
  [123, Type.Integer, Type.Integer, 123],
  [123, Type.Integer, Type.Real, 123],
  [123, Type.Integer, Type.Boolean, true],
  [0, Type.Integer, Type.Boolean, false],
  [123, Type.Integer, Type.String, '123'],
  [123, Type.Integer, Type.Exception, TypeError],
  [123, Type.Integer, Type.Nil, TypeError],
  [123, Type.Integer, Type.Any, RuntimeFault],

  [123.456, Type.Real, Type.Integer, 123],
  [123.456, Type.Real, Type.Real, 123.456],
  [123.456, Type.Real, Type.Boolean, true],
  [0.0, Type.Real, Type.Boolean, false],
  [123.456, Type.Real, Type.String, '123.456'],
  [123.456, Type.Real, Type.Exception, TypeError],
  [123.456, Type.Real, Type.Nil, TypeError],
  [123.456, Type.Real, Type.Any, RuntimeFault],

  [true, Type.Boolean, Type.Integer, 1],
  [true, Type.Boolean, Type.Real, 1.0],
  [true, Type.Boolean, Type.Boolean, true],
  [true, Type.Boolean, Type.String, 'true'],
  [true, Type.Boolean, Type.Exception, TypeError],
  [true, Type.Boolean, Type.Nil, TypeError],
  [true, Type.Boolean, Type.Any, RuntimeFault],

  ['hello', Type.String, Type.Integer, NotImplementedFault],
  ['123', Type.String, Type.Integer, NotImplementedFault],
  ['hello', Type.String, Type.Real, NotImplementedFault],
  ['123.456', Type.String, Type.Real, NotImplementedFault],
  ['hello', Type.String, Type.Boolean, true],
  ['', Type.String, Type.Boolean, false],
  ['hello', Type.String, Type.String, 'hello'],
  ['hello', Type.String, Type.Exception, TypeError],
  ['hello', Type.String, Type.Nil, TypeError],
  ['hello', Type.String, Type.Any, RuntimeFault],

  [EXCEPTION, Type.Exception, Type.Integer, TypeError],
  [EXCEPTION, Type.Exception, Type.Real, TypeError],
  [EXCEPTION, Type.Exception, Type.Boolean, true],
  [EXCEPTION, Type.Exception, Type.String, formatter.format(EXCEPTION)],
  [EXCEPTION, Type.Exception, Type.Exception, EXCEPTION],
  [EXCEPTION, Type.Exception, Type.Nil, TypeError],
  [EXCEPTION, Type.Exception, Type.Any, RuntimeFault],

  [nil, Type.Nil, Type.Integer, 0],
  [nil, Type.Nil, Type.Real, 0.0],
  [nil, Type.Nil, Type.Boolean, false],
  [nil, Type.Nil, Type.String, 'nil'],
  [nil, Type.Nil, Type.Exception, TypeError],
  [nil, Type.Nil, Type.Nil, nil],
  [nil, Type.Nil, Type.Any, RuntimeFault],

  [undef, Type.Undef, Type.Integer, 0],
  [undef, Type.Undef, Type.Real, 0.0],
  [undef, Type.Undef, Type.Boolean, false],
  [undef, Type.Undef, Type.String, 'nil'],
  [undef, Type.Undef, Type.Exception, TypeError],
  [undef, Type.Undef, Type.Nil, nil],
  [undef, Type.Undef, Type.Any, RuntimeFault],
];

function testInto([value, from_, to_, expected]: TestCase): void {
  const proto = (expected as any).prototype;
  const isError = proto instanceof BaseException || proto instanceof BaseFault;
  const isUnimplemented = isError
    ? proto.name === 'NotImplementedFault'
    : false;

  if (isError) {
    test(`into(${formatter.format(value)}, ${from_}, ${to_}) throws a ${proto.name}`, () => {
      expect(() => into(value, from_, to_)).toThrowError(expected);
    });
  } else {
    test(`into(${formatter.format(value)}, ${from_}, ${to_}) -> ${expected}`, () => {
      expect(into(value, from_, to_)).toBe(expected);
    });

    if (expected === true || expected === false) {
      test(
        `into(${formatter.format(value)}, ${from_}, ${to_}) == ` +
          `truthy(${formatter.format(value)}, ${from_})`,
        () => {
          expect(into(value, from_, to_)).toBe(truthy(value, from_));
        },
      );
    }
  }

  if (from_ === Type.Any || to_ === Type.Any) {
    test(`intoType(${from_}, ${to_}) -> any`, () => {
      expect(intoType(from_, to_)).toBe(Type.Any);
    });
  } else if (isError && !isUnimplemented) {
    test(`intoType(${from_}, ${to_}) -> invalid`, () => {
      expect(intoType(from_, to_)).toBe(Type.Invalid);
    });
  } else {
    test(`intoType(${from_}, ${to_}) -> ${to_}`, () => {
      expect(intoType(from_, to_)).toBe(to_);
    });
  }
}

function testIntoFromAny([value, _, to_, expected]: TestCase): void {
  return testInto([value, Type.Any, to_, expected]);
}

describe('convert', () => {
  for (const case_ of CASES) {
    testInto(case_);
  }

  for (const case_ of CASES) {
    testIntoFromAny(case_);
  }
});
