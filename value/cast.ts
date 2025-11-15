import { nil, Nil, Value } from './';
import { Type } from './types';
import { typeOf } from './typeof';
import { BaseException, TypeError } from '../exceptions';
import { RuntimeFault } from '../faults';

//
// Type casting. Be prepared for massive function signature overloads!
//
// Note that casting succeeds or fails not based on whether there's a sensible
// convertion, but on whether or not the cast is allowed to occur implicitly.
// For example, the number `123` could be converted to `"123"`, but
// you're not allowed to execute `123 + "hello"` - hence, casting `123` to a
// string causes a TypeError.
//
// TODO: Should I simply implement separate functions for each cast instead
// of switching on a Type enum each time? I like this API but it's doing a
// runtime check I can technically avoid.
//

function castError(value: Value, from_: string, to_: string): never {
  throw new TypeError(`Cannot cast ${from_} to ${to_}`, value, from_, to_);
}

function castFault(value: Value, from_: string, to_: string): never {
  try {
    castError(value, from_, to_);
  } catch (err) {
    throw new RuntimeFault(`Cannot cast ${from_} to ${to_}`, err);
  }
}

function castInteger(value: number, to_: Type.Integer): number;
function castInteger(value: number, to_: Type.Real): number;
function castInteger(value: number, to_: Type.Boolean): boolean;
function castInteger(value: number, to_: Type.String): never;
function castInteger(value: number, to_: Type.Exception): never;
function castInteger(value: number, to_: Type.Nil): never;
function castInteger(value: number, to_: Type): never;
function castInteger(value: number, to_: Type): Value {
  switch (to_) {
    case Type.Integer:
      return value;
    case Type.Real:
      return value;
    case Type.Boolean:
      return !!value;
    case Type.String:
      return castError(value, Type.Integer, Type.String);
    case Type.Exception:
      return castError(value, Type.Integer, Type.Exception);
    case Type.Nil:
      return castError(value, Type.Integer, Type.Nil);
  }

  return castFault(value, Type.Integer, Type.Unknown);
}

function castIntegerType(to_: Type): Type {
  switch (to_) {
    case Type.Integer:
      return Type.Integer;
    case Type.Real:
      return Type.Real;
    case Type.Boolean:
      return Type.Boolean;
    case Type.Any:
      return Type.Any;
    default:
      return Type.Invalid;
  }
}

function castReal(value: number, to_: Type.Integer): number;
function castReal(value: number, to_: Type.Real): number;
function castReal(value: number, to_: Type.Boolean): boolean;
function castReal(value: number, to_: Type.String): never;
function castReal(value: number, to_: Type.Exception): never;
function castReal(value: number, to_: Type.Nil): never;
function castReal(value: number, to_: Type): never;
function castReal(value: number, to_: Type): Value {
  switch (to_) {
    case Type.Integer:
      return Math.floor(value);
    case Type.Real:
      return value;
    case Type.Boolean:
      return !!value;
    case Type.String:
      return castError(value, Type.Real, Type.String);
    case Type.Exception:
      return castError(value, Type.Real, Type.Exception);
    case Type.Nil:
      return castError(value, Type.Real, Type.Nil);
  }

  return castFault(value, Type.Real, Type.Unknown);
}

function castRealType(to_: Type): Type {
  switch (to_) {
    case Type.Integer:
      return Type.Integer;
    case Type.Real:
      return Type.Real;
    case Type.Boolean:
      return Type.Boolean;
    case Type.Any:
      return Type.Any;
    default:
      return Type.Invalid;
  }
}

function castBoolean(value: boolean, to_: Type.Integer): number;
function castBoolean(value: boolean, to_: Type.Real): number;
function castBoolean(value: boolean, to_: Type.Boolean): boolean;
function castBoolean(value: boolean, to_: Type.String): never;
function castBoolean(value: boolean, to_: Type.Exception): never;
function castBoolean(value: boolean, to_: Type.Nil): never;
function castBoolean(value: boolean, to_: Type): never;
function castBoolean(value: boolean, to_: Type): Value {
  switch (to_) {
    case Type.Integer:
      return 1;
    case Type.Real:
      return 1.0;
    case Type.Boolean:
      return value;
    case Type.String:
      return castError(value, Type.Boolean, Type.String);
    case Type.Exception:
      return castError(value, Type.Boolean, Type.Exception);
    case Type.Nil:
      return castError(value, Type.Boolean, Type.Nil);
  }

  return castFault(value, Type.Boolean, Type.Unknown);
}

function castBooleanType(to_: Type): Type {
  switch (to_) {
    case Type.Integer:
      return Type.Integer;
    case Type.Real:
      return Type.Real;
    case Type.Boolean:
      return Type.Boolean;
    case Type.Any:
      return Type.Any;
    default:
      return Type.Invalid;
  }
}

function castString(value: string, to_: Type.Integer): never;
function castString(value: string, to_: Type.Real): never;
function castString(value: string, to_: Type.Boolean): boolean;
function castString(value: string, to_: Type.String): string;
function castString(value: string, to_: Type.Exception): never;
function castString(value: string, to_: Type.Nil): never;
function castString(value: string, to_: Type): never;
function castString(value: string, to_: Type): Value {
  switch (to_) {
    case Type.Integer:
      return castError(value, Type.String, Type.Integer);
    case Type.Real:
      return castError(value, Type.String, Type.Real);
    case Type.Boolean:
      return !!value.length;
    case Type.String:
      return value;
    case Type.Exception:
      return castError(value, Type.String, Type.Exception);
    case Type.Nil:
      return castError(value, Type.String, Type.Nil);
  }

  return castFault(value, Type.String, Type.Unknown);
}

function castStringType(to_: Type): Type {
  switch (to_) {
    case Type.Boolean:
      return Type.Boolean;
    case Type.String:
      return Type.String;
    case Type.Any:
      return Type.Any;
    default:
      return Type.Invalid;
  }
}

function castException(value: BaseException, to_: Type.Integer): never;
function castException(value: BaseException, to_: Type.Real): never;
function castException(value: BaseException, to_: Type.Boolean): boolean;
function castException(value: BaseException, to_: Type.String): never;
function castException(
  value: BaseException,
  to_: Type.Exception,
): BaseException;
function castException(value: BaseException, to_: Type.Nil): never;
function castException(value: BaseException, to_: Type): never;
function castException(value: BaseException, to_: Type): Value {
  switch (to_) {
    case Type.Integer:
      return castError(value, Type.Exception, Type.Integer);
    case Type.Real:
      return castError(value, Type.Exception, Type.Real);
    case Type.Boolean:
      return true;
    case Type.String:
      return castError(value, Type.Exception, Type.String);
    case Type.Exception:
      return value;
    case Type.Nil:
      return castError(value, Type.Exception, Type.Nil);
  }

  return castFault(value, Type.Exception, Type.Unknown);
}

function castExceptionType(to_: Type): Type {
  switch (to_) {
    case Type.Boolean:
      return Type.Boolean;
    case Type.Exception:
      return Type.Exception;
    case Type.Any:
      return Type.Any;
    default:
      return Type.Invalid;
  }
}

function castNil(value: Nil, to_: Type.Integer): never;
function castNil(value: Nil, to_: Type.Real): never;
function castNil(value: Nil, to_: Type.Boolean): boolean;
function castNil(value: Nil, to_: Type.String): never;
function castNil(value: Nil, to_: Type.Exception): never;
function castNil(value: Nil, to_: Type.Nil): Nil;
function castNil(value: Nil, to_: Type): Value;
function castNil(value: Nil, to_: Type): Value {
  switch (to_) {
    case Type.Integer:
      return castError(value, Type.Nil, Type.Integer);
    case Type.Real:
      return castError(value, Type.Nil, Type.Integer);
    case Type.Boolean:
      return false;
    case Type.String:
      return castError(value, Type.Nil, Type.String);
    case Type.Exception:
      return castError(value, Type.Nil, Type.Exception);
    case Type.Nil:
      return value;
  }

  return castFault(value, Type.Nil, Type.Unknown);
}

function castNilType(to_: Type): Type {
  switch (to_) {
    case Type.Boolean:
      return Type.Boolean;
    case Type.Nil:
      return Type.Nil;
    case Type.Any:
      return Type.Any;
    default:
      return Type.Invalid;
  }
}

function cast(value: Value, from_: Type.Integer, to_: Type.Integer): number;
function cast(value: Value, from_: Type.Integer, to_: Type.Real): number;
function cast(value: Value, from_: Type.Integer, to_: Type.Boolean): boolean;
function cast(value: Value, from_: Type.Integer, to_: Type.String): string;
function cast(
  value: Value,
  from_: Type.Integer,
  to_: Type.Exception,
): BaseException;
function cast(value: Value, from_: Type.Real, to_: Type.Integer): number;
function cast(value: Value, from_: Type.Real, to_: Type.Real): number;
function cast(value: Value, from_: Type.Real, to_: Type.Boolean): boolean;
function cast(value: Value, from_: Type.Real, to_: Type.String): string;
function cast(
  value: Value,
  from_: Type.Real,
  to_: Type.Exception,
): BaseException;
function cast(value: Value, from_: Type.Boolean, to_: Type.Integer): number;
function cast(value: Value, from_: Type.Boolean, to_: Type.Real): number;
function cast(value: Value, from_: Type.Boolean, to_: Type.Boolean): boolean;
function cast(value: Value, from_: Type.Boolean, to_: Type.String): string;
function cast(
  value: Value,
  from_: Type.Boolean,
  to_: Type.Exception,
): BaseException;
function cast(value: Value, from_: Type.String, to_: Type.Integer): number;
function cast(value: Value, from_: Type.String, to_: Type.Real): number;
function cast(value: Value, from_: Type.String, to_: Type.Boolean): boolean;
function cast(value: Value, from_: Type.String, to_: Type.String): string;
function cast(
  value: Value,
  from_: Type.String,
  to_: Type.Exception,
): BaseException;
function cast(value: Value, from_: Type.Exception, to_: Type.Integer): number;
function cast(value: Value, from_: Type.Exception, to_: Type.Real): number;
function cast(value: Value, from_: Type.Exception, to_: Type.Boolean): boolean;
function cast(value: Value, from_: Type.Exception, to_: Type.String): string;
function cast(
  value: Value,
  from_: Type.Exception,
  to_: Type.Exception,
): BaseException;
function cast(value: Value, from_: Type.Nil, to_: Type.Integer): number;
function cast(value: Value, from_: Type.Nil, to_: Type.Real): number;
function cast(value: Value, from_: Type.Nil, to_: Type.Boolean): boolean;
function cast(value: Value, from_: Type.Nil, to_: Type.String): string;
function cast(
  value: Value,
  from_: Type.Nil,
  to_: Type.Exception,
): BaseException;
function cast(value: Value, from_: Type.Undef, to_: Type.Integer): number;
function cast(value: Value, from_: Type.Undef, to_: Type.Real): number;
function cast(value: Value, from_: Type.Undef, to_: Type.Boolean): boolean;
function cast(value: Value, from_: Type.Undef, to_: Type.String): string;
function cast(
  value: Value,
  from_: Type.Undef,
  to_: Type.Exception,
): BaseException;
function cast(value: Value, from_: Type.Any, to_: Type.Integer): number;
function cast(value: Value, from_: Type.Any, to_: Type.Real): number;
function cast(value: Value, from_: Type.Any, to_: Type.Boolean): boolean;
function cast(value: Value, from_: Type.Any, to_: Type.String): string;
function cast(
  value: Value,
  from_: Type.Any,
  to_: Type.Exception,
): BaseException;
function cast(value: Value, from_: Type, to_: Type): never;
function cast(value: Value, from_: Type, to_: Type): Value {
  if (from_ === Type.Any) {
    from_ = typeOf(value);
  }

  switch (from_) {
    case Type.Integer:
      return castInteger(value as number, to_);
    case Type.Real:
      return castReal(value as number, to_);
    case Type.Boolean:
      return castBoolean(value as boolean, to_);
    case Type.String:
      return castString(value as string, to_);
    case Type.Exception:
      return castException(value as BaseException, to_);
    case Type.Nil:
      return castNil(value as Nil, to_);
    case Type.Undef:
      return castNil(nil, to_);
    default:
      return castFault(value, Type.Unknown, Type.Unknown);
  }
}

function castType(from_: Type, to_: Type): Type {
  switch (from_) {
    case Type.Integer:
      return castIntegerType(to_);
    case Type.Real:
      return castRealType(to_);
    case Type.Boolean:
      return castBooleanType(to_);
    case Type.String:
      return castStringType(to_);
    case Type.Exception:
      return castExceptionType(to_);
    case Type.Nil:
      return castNilType(to_);
    case Type.Undef:
      return castNilType(to_);
    case Type.Any:
      return Type.Any;
    default:
      return Type.Invalid;
  }
}

export { cast, castType };
