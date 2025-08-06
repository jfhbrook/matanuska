import * as assert from 'assert';

import { describe, test } from 'vitest';
import { t } from '../helpers/tap';

import { Formatter } from '../../format';

import { ErrorCode } from '../../errors';
import {
  BaseException,
  Exception,
  RuntimeError,
  TypeError,
  NotImplementedError,
  AssertionError,
  BaseWarning,
  ZeroDivisionError,
  OsError,
  FileError,
  SyntaxError,
  ParseError,
  SyntaxWarning,
  ParseWarning,
} from '../../exceptions';
import { ExitCode } from '../../exit';
import { BaseFault, RuntimeFault, UsageFault } from '../../faults';
import { Source } from '../../ast/source';
import { FILENAME } from '../helpers/files';
import { scrubNodeVersion } from '../helpers/format';
import { TRACEBACK } from '../helpers/traceback';

export function tracebackSuite<F extends Formatter>(formatter: F): void {
  test('it formats a Traceback', () => {
    t.matchSnapshot(formatter.format(TRACEBACK));
  });
}

export function exceptionsSuite<F extends Formatter>(formatter: F): void {
  for (const ctor of [
    BaseException,
    Exception,
    RuntimeError,
    NotImplementedError,
  ]) {
    test(`it formats a ${ctor.prototype.name}`, () => {
      t.matchSnapshot(formatter.format(new ctor('message', TRACEBACK)));
    });
  }

  test('it formats a BaseWarning', () => {
    t.matchSnapshot(formatter.format(new BaseWarning('message', TRACEBACK)));
  });

  test('it formats a BaseWarning without a traceback', () => {
    t.matchSnapshot(formatter.format(new BaseWarning('message', null)));
  });

  test('it formats an AssertionError', () => {
    t.matchSnapshot(formatter.format(new AssertionError('message', TRACEBACK)));
  });

  test('it formats a TypeError', () => {
    t.matchSnapshot(
      formatter.format(
        new TypeError('message', 123, 'integer', 'nil', TRACEBACK),
      ),
    );
  });

  test('it formats a ZeroDivisionError', () => {
    t.matchSnapshot(
      formatter.format(
        new ZeroDivisionError(1, 'integer', 0, 'integer', TRACEBACK),
      ),
    );
  });

  test('it formats an OsError', () => {
    t.matchSnapshot(
      formatter.format(
        new OsError('message', ErrorCode.AddressInUse, null, TRACEBACK),
      ),
    );
  });

  test('it formats a FileError with one file', () => {
    t.matchSnapshot(
      formatter.format(
        new FileError(
          'message',
          ErrorCode.Access,
          ExitCode.NoInput,
          [FILENAME],
          TRACEBACK,
        ),
      ),
    );
  });

  test('it formats a FileError with two files', () => {
    t.matchSnapshot(
      formatter.format(
        new FileError(
          'message',
          ErrorCode.Access,
          ExitCode.NoInput,
          [FILENAME, 'another.bas'],
          TRACEBACK,
        ),
      ),
    );
  });
}

const LINE = '100 print someFn(ident';
const IS_LINE = [true, false];

export function parserExceptionsSuite<F extends Formatter>(formatter: F): void {
  for (const isLine of IS_LINE) {
    describe(`when it ${isLine ? 'is' : 'is not'} a line`, () => {
      const line = isLine
        ? Source.command(LINE)
        : Source.command(LINE.replace(/^\d+ /, ''));
      test('it formats a SyntaxError', () => {
        t.matchSnapshot(
          formatter.format(
            new SyntaxError('expected )', {
              filename: FILENAME,
              row: 0,
              isLine,
              lineNo: 100,
              cmdNo: isLine ? 10 : null,
              offsetStart: 22,
              offsetEnd: 23,
              source: line,
            }),
          ),
        );
      });

      test('it formats a ParseError', () => {
        t.matchSnapshot(
          formatter.format(
            new ParseError([
              new SyntaxError('expected )', {
                filename: FILENAME,
                row: 0,
                isLine,
                lineNo: 100,
                cmdNo: isLine ? 10 : null,
                offsetStart: 22,
                offsetEnd: 23,
                source: line,
              }),
              new SyntaxWarning('identifier has no sigil', {
                filename: FILENAME,
                row: 0,
                isLine,
                lineNo: 100,
                cmdNo: isLine ? 10 : null,
                offsetStart: 17,
                offsetEnd: 18,
                source: line,
              }),
            ]),
          ),
        );
      });

      test('it formats a SyntaxWarning', () => {
        t.matchSnapshot(
          formatter.format(
            new SyntaxWarning('expected )', {
              filename: FILENAME,
              row: 0,
              isLine,
              lineNo: 100,
              cmdNo: isLine ? 10 : null,
              offsetStart: 22,
              offsetEnd: 23,
              source: line,
            }),
          ),
        );
      });

      test('it formats a ParseWarning', () => {
        t.matchSnapshot(
          formatter.format(
            new ParseWarning([
              new SyntaxWarning('identifier has no sigil', {
                filename: FILENAME,
                row: 0,
                isLine,
                lineNo: 100,
                cmdNo: isLine ? 10 : null,
                offsetStart: 17,
                offsetEnd: 18,
                source: line,
              }),
            ]),
          ),
        );
      });
    });
  }
}

export function faultsSuite<F extends Formatter>(formatter: F): void {
  test('it formats a BaseFault', () => {
    t.matchSnapshot(formatter.format(new BaseFault('message', TRACEBACK)));
  });

  test('it formats a RuntimeFault', () => {
    const underlying = new assert.AssertionError({
      message: 'underlying assertion',
      actual: false,
      expected: true,
      operator: '===',
    });

    t.matchSnapshot(
      scrubNodeVersion(
        formatter.format(
          new RuntimeFault('Some runtime fault', underlying, TRACEBACK),
        ),
      ),
    );
  });

  test('it formats a UsageFault', () => {
    t.matchSnapshot(formatter.format(new UsageFault('Usage: lol')));
  });
}
