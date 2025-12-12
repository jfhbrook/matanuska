import { Value } from './';
import { Type } from './types';
import { typeOf } from './typeof';
import { TypeError } from '../exceptions';
import { formatter } from '../format';

//
// Truthiness and falsiness. Falsiness can also be thought of as the "not"
// operation.
//

export function truthy(value: Value, type: Type = Type.Any): boolean {
  if (type === Type.Any) {
    type = typeOf(value);
  }

  switch (type) {
    case Type.Integer:
    case Type.Real:
      return value != 0;
    case Type.Boolean:
      return value as boolean;
    case Type.String:
      return (value as string).length > 0;
    case Type.Exception:
      return true;
    case Type.Nil:
    case Type.Undef:
      return false;
    case Type.Input:
    case Type.Program:
    case Type.Function:
      return true;
    default:
      throw new TypeError(
        `Cannot determine if ${formatter.format(value)} is truthy`,
        value,
        type,
        Type.Boolean,
      );
  }
}

export function falsey(value: Value, type: Type = Type.Any): boolean {
  if (type === Type.Any) {
    type = typeOf(value);
  }

  switch (type) {
    case Type.Integer:
    case Type.Real:
      return value === 0;
    case Type.Boolean:
      return !value;
    case Type.String:
      return !(value as string).length;
    case Type.Exception:
      return false;
    case Type.Nil:
    case Type.Undef:
      return true;
    case Type.Input:
    case Type.Program:
    case Type.Function:
      return false;
    default:
      throw new TypeError(
        `Cannot determine if ${formatter.format(value)} is truthy`,
        value,
        type,
        Type.Boolean,
      );
  }
}
