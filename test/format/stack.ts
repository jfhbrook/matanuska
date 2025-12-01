import { test, expect } from 'vitest';

import { FILENAME } from '../helpers/files';

import { BaseException } from '../../exceptions';
import { Formatter } from '../../format';
import { Stack } from '../../stack';
import { Token, TokenKind } from '../../tokens';
import { Traceback } from '../../traceback';
import { nil, Routine, RoutineType, Value } from '../../value';

export function stackSuite<F extends Formatter>(formatter: F): void {
  const stack: Stack<Value> = new Stack();

  stack.stack = [
    12,
    true,
    'foo',
    new BaseException('oops', new Traceback(null, FILENAME, 'foo', 100)),
    new Routine(
      RoutineType.Function,
      FILENAME,
      new Token({
        kind: TokenKind.Ident,
        index: 0,
        row: 0,
        offsetStart: 0,
        offsetEnd: 3,
        text: 'foo',
        value: 'foo',
      }),
    ),
    nil,
  ];

  test('it formats a stack', () => {
    expect(formatter.format(stack)).toMatchSnapshot();
  });
}
