import { Value } from './';
import { Type } from './types';
import { typeOf } from './typeof';

//
// Nullishness. Undef is generally treated as Null within the context of the
// runtime.
//

export function nullish(value: Value, type: Type = Type.Any): boolean {
  if (type === Type.Any) {
    type = typeOf(value);
  }

  switch (type) {
    case Type.Nil:
    case Type.Undef:
      return true;
    default:
      return false;
  }
}
