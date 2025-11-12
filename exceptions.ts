import { ExitCode, ExitCoded } from './exit';
import { errorType, ErrorCode } from './errors';
import { Formattable, Formatter, formatter } from './format';
import { Traceable, Traceback } from './traceback';
import type { Value } from './value';
import { Source } from './ast/source';

/**
 * The base class for all Exceptions, including fatal exceptions.
 */
@errorType('BaseException')
export class BaseException extends Error implements Traceable, Formattable {
  /**
   * @param message The message for the exception.
   * @param traceback The traceback for the exception.
   */
  constructor(
    public message: any,
    public traceback: Traceback | null = null,
  ) {
    const msg =
      typeof message === 'string' ? message : formatter.format(message);
    super(msg);
    Object.setPrototypeOf(this, new.target.prototype);

    // TODO: Exceptions in Python store all args the constructor is called
    // with, not just a message.
    // TODO: Implement notes a la Python?
    // See: https://docs.python.org/3/tutorial/errors.html#enriching-exceptions-with-notes
  }

  format(formatter: Formatter): string {
    return formatter.formatBaseException(this);
  }
}

/**
 * The base class for all built-in, non-fatal exceptions. User
 * exceptions should be derived from this class.
 */
@errorType('Exception')
export class Exception extends BaseException {}

//
// Non-fatal errors.
//

/**
 * An exception raised by an assertion.
 */
@errorType('AssertionError')
export class AssertionError extends Exception {
  format(formatter: Formatter): string {
    return formatter.formatAssertionError(this);
  }
}

/**
 * An exception raised on errors in the runtime.
 */
@errorType('RuntimeError')
export class RuntimeError extends Exception {}

/**
 * An exception raised when casting is not supported.
 */
@errorType('TypeError')
export class TypeError extends RuntimeError {
  public from: string;
  public to: string;
  /**
   * @param message The message for the exception.
   * @param value The value attempted to cast
   * @param from_ The type attempted to cast from
   * @param to_ The type attempted to cast to
   * @param traceback The traceback for the exception.
   */
  constructor(
    public readonly message: any,
    public readonly value: Value,
    from_: string,
    to_: string,
    public traceback: Traceback | null = null,
  ) {
    super(message, traceback);
    this.from = from_;
    this.to = to_;
  }

  format(formatter: Formatter): string {
    return formatter.formatTypeError(this);
  }
}

/**
 * An exception raised for unexpected values. Extends RuntimeError.
 */
@errorType('ValueError')
export class ValueError extends RuntimeError {}

/**
 * An exception raised when a variable or property can't be found. Extends
 * RuntimeError.
 */
@errorType('NameError')
export class NameError extends RuntimeError {}

/**
 * An exception raised when an unexpected parameter is encountered. Extends
 * RuntimeError.
 */
@errorType('ParamError')
export class ParamError extends RuntimeError {}

/**
 * An exception raised for various arithmetic errors. Extends RuntimeError.
 */
@errorType('ArithmeticError')
export class ArithmeticError extends RuntimeError {}

/**
 * An exception raised when attempting to divide by zero. Extends
 * ArithmeticError.
 */
@errorType('ZeroDivisionError')
export class ZeroDivisionError extends ArithmeticError {
  constructor(
    public readonly a: Value,
    public readonly typeA: string,
    public readonly b: Value,
    public readonly typeB: string,
    public traceback: Traceback | null = null,
  ) {
    const message = 'Cannot divide by zero';
    super(message, traceback);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  format(formatter: Formatter): string {
    return formatter.formatZeroDivisionError(this);
  }
}

/**
 * An exception raised when functionality is not implemented. Extends
 * RuntimeError.
 */
@errorType('NotImplementedError')
export class NotImplementedError extends RuntimeError {}

//
// Warnings.
//

/**
 * The base class for all warnings. Warnings are non-fatal and can not be
 * caught.
 */
@errorType('BaseWarning')
export class BaseWarning extends BaseException {
  format(formatter: Formatter): string {
    return formatter.formatBaseWarning(this);
  }
}

/**
 * The base class for all user warnings.
 */
@errorType('Warning')
export class Warning extends BaseWarning {}

/**
 * A warning for deprecated functionality.
 */
@errorType('DeprecationWarning')
export class DeprecationWarning extends Warning {}

//
// OS and file IO errors.
//

/**
 * An operating system level error.
 */
@errorType('OsError')
export class OsError extends Exception implements ExitCoded {
  public readonly exitCode: ExitCode;

  /**
   * @param message The message for the exception.
   * @param code The Node.JS system error code.
   * @param exitCode The exit code for the exception. If null, a default exit
   *        code will be set based on the error code.
   * @param traceback The traceback for the exception.
   */
  constructor(
    public readonly message: any,
    public readonly code: ErrorCode | string,
    exitCode: ExitCode | null,
    public readonly traceback: Traceback | null,
  ) {
    super(message, traceback);
    Object.setPrototypeOf(this, new.target.prototype);

    if (exitCode) {
      this.exitCode = exitCode;
    } else {
      switch (code) {
        // NOTE: For FileErrors, ErrorCode.Access maps to ExitCode.NoInput
        // for read operations and ExitCode.CantCreate for write operations.
        case ErrorCode.Access:
          this.exitCode = ExitCode.OsError;
          break;
        case ErrorCode.AddressInUse:
          // There are arguments for this being Unavailable, OsError or
          // Software.
          this.exitCode = ExitCode.Protocol;
          break;
        case ErrorCode.ConnectionRefused:
        case ErrorCode.ConnectionReset:
          this.exitCode = ExitCode.Unavailable;
          break;
        case ErrorCode.Exists:
          this.exitCode = ExitCode.CantCreate;
          break;
        case ErrorCode.IsDirectory:
          this.exitCode = ExitCode.IoError;
          break;
        case ErrorCode.MaxFileDescriptors:
          this.exitCode = ExitCode.OsError;
          break;
        case ErrorCode.NoEntity:
          this.exitCode = ExitCode.NoInput;
          break;
        case ErrorCode.NotADirectory:
          this.exitCode = ExitCode.NoInput;
          break;
        case ErrorCode.NotEmpty:
          // TODO: There's an argument for this being an IoError.
          this.exitCode = ExitCode.OsError;
          break;
        case ErrorCode.DnsNotFound:
          this.exitCode = ExitCode.NoHost;
          break;
        case ErrorCode.NotPermitted:
          // NOTE: Assuming this will not be seen for user filesystem
          // permissions.
          this.exitCode = ExitCode.NoPermission;
          break;
        case ErrorCode.BrokenPipe:
          this.exitCode = ExitCode.OsError;
          break;
        case ErrorCode.TimedOut:
          // NOTE: Unavailable is appropriate for network timeouts. For other
          // kinds of timeout, there may be better exit codes.
          this.exitCode = ExitCode.Unavailable;
          break;
        default:
          this.exitCode = ExitCode.OsError;
      }
    }
  }

  format(formatter: Formatter): string {
    return formatter.formatOsError(this);
  }
}

/**
 * The path(s) being used by an operations which raised a FileError.
 */
export type FileErrorPaths = [string] | [string, string];

function getFileErrorMessage(err: NodeJS.ErrnoException): string {
  const split = err.message.split(': ');
  if (split.length === 2) {
    return split[1];
  }
  return err.message;
}

/**
 * An error raised when a known file operation fails. Includes the target
 * filename(s) and a more specific exit code.
 */
@errorType('FileError')
export class FileError extends OsError {
  /**
   * @param message The message for the exception.
   * @param code The Node.JS system error code.
   * @param exitCode The exit code for the exception. If null, a default exit
   *        code will be set based on the error code.
   * @param paths The target path(s) for the operation.
   * @param traceback The traceback for the exception.
   */
  constructor(
    public message: any,
    public code: ErrorCode | string,
    exitCode: ExitCode | null,
    public paths: FileErrorPaths,
    public traceback: Traceback | null,
  ) {
    super(message, code, exitCode, traceback);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Naively create a FileError from a Node.js error.
   *
   * @param message The message for the error. If null, taken directly from
   * the Node.JS error.
   * @param err The Node.JS error.
   * @param traceback The traceback for the error.
   */
  static fromError(
    message: any,
    err: NodeJS.ErrnoException,
    traceback: Traceback | null = null,
  ): FileError {
    const msg = message || getFileErrorMessage(err);
    return new FileError(
      msg,
      err.code || '<unknown>',
      null,
      [err.path || '<unknown>'],
      traceback,
    );
  }

  /**
   * Create a FileError from a Node.js error for a read operation.
   *
   * @param message The message for the error. If null, taken directly from
   * the Node.JS error.
   * @param err The Node.JS error.
   * @param traceback The traceback for the error.
   */
  static fromReadError(
    message: any,
    err: NodeJS.ErrnoException,
    traceback: Traceback | null = null,
  ): FileError {
    const msg = message || getFileErrorMessage(err);
    const code = err.code;
    let exitCode: ExitCode | null = null;

    if (code == ErrorCode.Access) {
      exitCode = ExitCode.NoInput;
    }

    return new FileError(
      msg,
      code || '<unknown>',
      exitCode,
      [err.path || '<unknown>'],
      traceback,
    );
  }

  /**
   * Create a FileError from a Node.js error for a write operation.
   *
   * @param message The message for the error. If null, taken directly from
   * the Node.JS error.
   * @param err The Node.JS error.
   * @param traceback The traceback for the error.
   */
  static fromWriteError(
    message: any | null,
    err: NodeJS.ErrnoException,
    traceback: Traceback | null = null,
  ): FileError {
    const msg = message || getFileErrorMessage(err);
    const code = err.code;
    let exitCode: ExitCode | null = null;

    if (code == ErrorCode.Access) {
      exitCode = ExitCode.CantCreate;
    }

    return new FileError(
      msg,
      code || '<unknown>',
      exitCode,
      [err.path || '<unknown>'],
      traceback,
    );
  }

  format(formatter: Formatter): string {
    return formatter.formatFileError(this);
  }
}

//
// Syntax and parse errors and warnings.
//
// TODO: JavaScript and Python stop after a single error. However, Matanuska
// will attempt to complete the parse and flag multiple errors, more like C.
// This leads to some questions in their interfaces:
//
// 1. Individual syntax errors and warnings inherit from BaseException and
//    BaseWarning respectively. However, they don't have tracebacks - rather,
//    they have source locations. This suggests, along with the fact that they
//    are never thrown, that it may be inappropriate for them to be
//    Traceable - or even be called errors/warnings. Note that
//    the reporting in Python for source locations is very similar to
//    tracebacks, just without the word "Traceback".
// 2. ParseErrors and ParseWarnings also do not take tracebacks. This is
//    because parsing happens before runtime execution can occur. It may,
//    however, make sense to revisit this assumption.
// 2. ParseErrors and ParseWarnings have blank messages. This is acceptable
//    because the reporting will be based on the syntax errors/warnings, not
//    the top-level parse error. Should these classes have a message
//    getter that calls a formatter? Should they have a sensible default
//    message? This is an open question.
//

/**
 * The location referenced by a syntax error or warning.
 */
export interface SourceLocation {
  /**
   * The filename for the source code. This may be <interactive> for
   * interactive code, or <untitled> if the edited code has not been saved.
   */
  filename: string;

  /**
   * The row number in the source code. This is well defined even if the
   * input isn't a line.
   */
  row: number;

  /**
   * Whether or not the source location is in a line.
   */
  isLine: boolean;

  /**
   * The line number in the source code. When not in a line, this is the
   * previous line number.
   */
  lineNo: number | null;

  /**
   * The command number in the source code.
   */
  cmdNo: number | null;

  /**
   * The column offset at which the location starts.
   */
  offsetStart: number;

  /**
   * The column offset at which the location ends.
   */
  offsetEnd: number;

  /**
   * The referenced source code. Will typically be a line or interactive
   * command.
   */
  source: Source;

  // TODO: Add this when there are multi-line sytax structures.
  // endLineNo: number | null,
}

export type LocationKey = 'row' | 'lineNo' | 'cmdNo' | 'offsetStart';
export type ParseErrorSplit = Record<number, ParseError | ParseWarning>;
export type ParseWarningSplit = Record<number, ParseWarning>;

export interface LocationSortable {
  sort(keys: LocationKey[]): void;
}

function compareLocationKeys(keys: LocationKey[]) {
  return function compare(a: SourceLocation, b: SourceLocation): number {
    for (const key of keys) {
      const aKey: number = a[key] === null ? -1 : (a[key] as number);
      const bKey: number = b[key] === null ? -1 : (b[key] as number);
      const cmp = aKey - bKey;
      if (cmp) {
        return cmp;
      }
    }
    return 0;
  };
}

/**
 * An individual syntax error. Typically there will be multiple syntax errors
 * or warnings encapsulated in a ParseError. They are not intended to be
 * thrown.
 */
@errorType('SyntaxError')
export class SyntaxError extends BaseException implements SourceLocation {
  public filename: string;
  public row: number;
  public isLine: boolean;
  public lineNo: number;
  public cmdNo: number;
  public offsetStart: number;
  public offsetEnd: number;
  public source: Source;

  /**
   * @param message The message for the exception.
   * @param location The location for the syntax error.
   */
  constructor(message: any, location: SourceLocation) {
    super(message, null);
    Object.setPrototypeOf(this, new.target.prototype);
    Object.assign(this, location);
  }

  format(formatter: Formatter): string {
    return formatter.formatSyntaxError(this);
  }
}

/**
 * A parse error. May contain one or more syntax errors or warnings.
 */
export class ParseError
  extends Exception
  implements LocationSortable, ExitCoded
{
  public exitCode = ExitCode.Software;

  /**
   * @param message The message for the exception.
   * @param errors A collection of syntax errors and warnings.
   * @param traceback The traceback for the exception.
   */
  constructor(public errors: Array<SyntaxError | SyntaxWarning>) {
    super('', null);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  sort(keys: LocationKey[]): void {
    this.errors.sort(compareLocationKeys(keys));
  }

  format(formatter: Formatter): string {
    return formatter.formatParseError(this);
  }
}

/**
 * A syntax warning. These warnings don't cause an unsuccessful parse, but are
 * likely undesirable. Typically there will be multiple syntax warnings
 * encapsulated in a ParseWarning. They are not intended to be logged
 * directly.
 */
@errorType('SyntaxWarning')
export class SyntaxWarning extends BaseWarning implements SourceLocation {
  public filename: string;
  public row: number;
  public isLine: boolean;
  public lineNo: number;
  public cmdNo: number;
  public offsetStart: number;
  public offsetEnd: number;
  public source: Source;

  /**
   * @param message The message for the exception.
   * @param location The location for the syntax error.
   */
  constructor(message: any, location: SourceLocation) {
    super(message, null);
    Object.setPrototypeOf(this, new.target.prototype);
    Object.assign(this, location);
  }

  format(formatter: Formatter): string {
    return formatter.formatSyntaxWarning(this);
  }
}

/**
 * A parse warning. This is analogous to a syntax error, but contains only
 * warnings.
 */
@errorType('ParseWarning')
export class ParseWarning extends Exception implements LocationSortable {
  /**
   * @param message The message for the exception.
   * @param warnings A collection of syntax warnings.
   * @param traceback The traceback for the exception.
   */
  constructor(public warnings: Array<SyntaxWarning>) {
    super('', null);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  sort(keys: LocationKey[]): void {
    this.warnings.sort(compareLocationKeys(keys));
  }

  format(formatter: Formatter): string {
    return formatter.formatParseWarning(this);
  }
}

// The assumption is that errors are already sorted. This may not
// be technically true, but it may be true *enough* that the result is
// sensible.
function merge<T extends SourceLocation>(
  xs: T[],
  ys: T[],
  keys: LocationKey[],
): T[] {
  let i = 0;
  let j = 0;
  const merged: T[] = [];

  while (true) {
    if (i >= xs.length) {
      return merged.concat(ys.slice(j));
    }
    if (j >= ys.length) {
      return merged.concat(xs.slice(i));
    }
    for (const key of keys) {
      const xKey: number =
        typeof xs[i][key] === 'number' ? (xs[i][key] as number) : -1;
      const yKey: number =
        typeof ys[j][key] === 'number' ? (ys[j][key] as number) : -1;
      if (xKey < yKey) {
        merged.push(xs[i++]);
        break;
      }
      if (xKey > yKey) {
        merged.push(ys[j++]);
        break;
      }
    }
  }
}

/**
 * Merge a collection of ParseErrors and/or ParseWarnings. Returns a
 * ParseError if any of its arguments are errors. If all arguments are null,
 * returns null. Otherwise, returns a ParseWarning.
 *
 * @param ...errors A list of ParseErrors and ParseWarnings
 * @returns A ParseError or ParseWarning
 */
function mergeParseErrors(errors: Array<null>): null;
function mergeParseErrors(errors: Array<null>, keys: LocationKey[]): null;
function mergeParseErrors(errors: Array<ParseWarning | null>): ParseWarning;
function mergeParseErrors(
  errors: Array<ParseWarning | null>,
  keys: LocationKey[],
): ParseWarning;
function mergeParseErrors(
  errors: Array<ParseError | ParseWarning | null>,
): ParseError;
function mergeParseErrors(
  errors: Array<ParseError | ParseWarning | null>,
  keys: LocationKey[],
): ParseError;
function mergeParseErrors(
  errors: Array<ParseError | ParseWarning | null>,
  keys: LocationKey[] = ['lineNo', 'row', 'offsetStart'],
): ParseError | ParseWarning | null {
  let isError = false;
  let isWarning = false;
  let syntaxErrors: Array<SyntaxError | SyntaxWarning> = [];
  for (const err of errors) {
    if (err instanceof ParseError) {
      isError = true;
      syntaxErrors = merge(syntaxErrors, err.errors, keys);
    } else if (err instanceof ParseWarning) {
      isWarning = true;
      syntaxErrors = merge(syntaxErrors, err.warnings, keys);
    }
  }

  if (isError) {
    return new ParseError(syntaxErrors as Array<SyntaxError | SyntaxWarning>);
  }
  if (isWarning) {
    return new ParseWarning(syntaxErrors as SyntaxWarning[]);
  }
  return null;
}

/**
 * Split a ParseError or ParseWarning into a Record of multiple ParseErrors or
 * ParseWarnings, grouped by the given key. If passed null, returns an empty
 * record.
 *
 * @returns A record mapping row number to ParseError or ParseWarning.
 */
function splitParseError(
  error: ParseError | null,
  key: LocationKey,
): ParseErrorSplit;
function splitParseError(
  error: ParseWarning | null,
  key: LocationKey,
): ParseWarningSplit;
function splitParseError(
  error: ParseError | ParseWarning | null,
  key: LocationKey,
): ParseErrorSplit | Record<number, null> {
  const isError: Record<number, boolean> = {};
  const splitted: Record<number, Array<SyntaxError | SyntaxWarning>> = {};

  function split(errors: Array<SyntaxError | SyntaxWarning>): void {
    for (const err of errors) {
      if (!splitted[err[key]]) {
        splitted[err[key]] = [];
      }

      if (err instanceof ParseError) {
        isError[err[key]] = true;
      }

      splitted[err[key]].push(err);
    }
  }

  if (error instanceof ParseError) {
    split(error.errors);
  } else if (error instanceof ParseWarning) {
    split(error.warnings);
  } else if (error === null) {
    return {} as Record<number, null>;
  }

  return Object.fromEntries(
    Object.entries(splitted).map(([row, errs]) => {
      let error: ParseError | ParseWarning;
      if (isError[row]) {
        error = new ParseError(errs);
      } else {
        error = new ParseWarning(errs);
      }

      return [row, error];
    }),
  );
}

function removeFromParseError(
  err: ParseError | null,
  key: LocationKey,
  value: number,
): ParseError | ParseWarning | null;
function removeFromParseError(
  err: ParseWarning | null,
  key: LocationKey,
  value: number,
): ParseWarning | null;
function removeFromParseError(
  err: ParseError | ParseWarning | null,
  key: LocationKey,
  value: number,
): ParseError | ParseWarning | null {
  let errors: Array<SyntaxError | SyntaxWarning> = [];

  if (err === null) {
    return null;
  }

  if (err instanceof ParseError) {
    errors = err.errors;
  } else {
    errors = err.warnings;
  }

  let isError = false;

  errors = errors.filter((e) => {
    if (e[key] === value) {
      return false;
    }
    if (e instanceof SyntaxError) {
      isError = true;
    }
    return true;
  });

  if (isError) {
    return new ParseError(errors);
  } else {
    return new ParseWarning(errors);
  }
}

function sortParseError(
  err: ParseError | ParseWarning | null,
  keys: LocationKey[],
): void {
  if (err) {
    err.sort(keys);
  }
}

export {
  mergeParseErrors,
  splitParseError,
  removeFromParseError,
  sortParseError,
};
