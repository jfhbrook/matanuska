import { describe, test } from 'vitest';
import { t } from '../helpers/tap';

import { ExitCode } from '../../exit';
import { ErrorCode } from '../../errors';

import { OsError } from '../../exceptions';

const DEFAULT_EXIT_CODES: Array<[ErrorCode | string, ExitCode]> = [
  ['EACCES', ExitCode.OsError],
  ['EADDRINUSE', ExitCode.Protocol],
  ['ECONNREFUSED', ExitCode.Unavailable],
  ['ECONNRESET', ExitCode.Unavailable],
  ['EEXIST', ExitCode.CantCreate],
  ['EISDIR', ExitCode.IoError],
  ['EMFILE', ExitCode.OsError],
  ['ENOENT', ExitCode.NoInput],
  ['ENOTDIR', ExitCode.NoInput],
  ['ENOTEMPTY', ExitCode.OsError],
  ['ENOTFOUND', ExitCode.NoHost],
  ['EPERM', ExitCode.NoPermission],
  ['EPIPE', ExitCode.OsError],
  ['ETIMEDOUT', ExitCode.Unavailable],
  ['EMYSTERY', ExitCode.OsError],
];

const EXIT_CODES: Array<ExitCode> = DEFAULT_EXIT_CODES.map(([_, code]) => code);

function testDefaultExitCode(code: string, exitCode: number): void {
  test(`it has a default exit code ${exitCode}`, () => {
    const exc = new OsError('Some OS error', code, null, null);

    t.ok(exc);
    t.equal(exc.message, 'Some OS error');
    t.equal(exc.exitCode, exitCode);
  });
}

function testOverriddenExitCode(code: string, exitCode: number): void {
  test(`it has an overridden exit code ${exitCode}`, () => {
    const exc = new OsError('Some OS error', code, exitCode, null);

    t.ok(exc);
    t.equal(exc.message, 'Some OS error');
    t.equal(exc.exitCode, exitCode);
  });
}

describe('OsError', () => {
  for (const [code, defaultExitCode] of DEFAULT_EXIT_CODES) {
    describe(`with error code ${code}`, () => {
      describe('when the exit code is overridden', () => {
        for (const overriddenExitCode of EXIT_CODES) {
          testOverriddenExitCode(code, overriddenExitCode);
        }
      });

      describe('when the exit code is set to null', () => {
        testDefaultExitCode(code, defaultExitCode);
      });
    });
  }
});
