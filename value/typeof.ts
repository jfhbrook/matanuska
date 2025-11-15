import { BaseException } from '../exceptions';
import { Type } from './types';
import { Value, Nil, Undef } from './index';

export function typeOf(value: Value): Type {
  const type = typeof value;
  if (type === 'boolean') {
    return Type.Boolean;
  }
  if (type === 'number') {
    if (Number.isInteger(value)) {
      return Type.Integer;
    }
    return Type.Real;
  }
  if (type === 'string') {
    return Type.String;
  }
  if (value instanceof Nil) {
    return Type.Nil;
  }
  if (value instanceof Undef) {
    return Type.Undef;
  }
  if (value instanceof BaseException) {
    return Type.Exception;
  }
  return Type.Unknown;
}
