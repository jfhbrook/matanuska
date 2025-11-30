import { test, expect } from 'vitest';

import { FILENAME } from '../helpers/files';

import { BaseException } from '../../exceptions';
import { Formatter } from '../../format';
import { Stack } from '../../stack';
import { Traceback } from '../../traceback';
import { nil, Routine, RoutineType, Value } from '../../value';

export function stackSuite<F extends Formatter>(formatter: F): void {
  const stack: Stack<Value> = new Stack();

  stack.stack = [
    12,
    true,
    'foo',
    new BaseException('oops', new Traceback(null, FILENAME, 'foo', 100)),
    new Routine(RoutineType.Function, FILENAME, 'foo'),
    nil,
  ];

  test('it formats a stack', () => {
    expect(formatter.format(stack)).toMatchSnapshot();
  });
}
