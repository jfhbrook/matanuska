import { describe, test } from 'vitest';
import { t } from '../helpers/tap';

import { ExitCode } from '../../exit';
import { ErrorCode } from '../../errors';

import { FileError } from '../../exceptions';

function fileErrorTest(
  method: 'fromError' | 'fromReadError' | 'fromWriteError',
  exitCode: ExitCode,
): void {
  test('without a custom message', () => {
    const exc = FileError[method](
      null,
      {
        message: 'Some file error',
        code: ErrorCode.Access,
        path: '/path/to/file',
      } as any,
      null,
    );

    t.ok(exc);
    t.equal(exc.message, 'Some file error');
    t.equal(exc.code, ErrorCode.Access);
    t.equal(exc.exitCode, exitCode);
    t.same(exc.paths, ['/path/to/file']);
    t.equal(exc.traceback, null);
  });

  test('with a custom message', () => {
    const exc = FileError[method](
      'Some custom file error',
      {
        message: 'Some file error',
        code: ErrorCode.Access,
        path: '/path/to/file',
      } as any,
      null,
    );

    t.ok(exc);
    t.equal(exc.message, 'Some custom file error');
    t.equal(exc.code, ErrorCode.Access);
    t.equal(exc.exitCode, exitCode);
    t.same(exc.paths, ['/path/to/file']);
    t.equal(exc.traceback, null);
  });

  test('with a non-access error code', () => {
    const exc = FileError[method](
      null,
      {
        message: 'Some file error',
        code: ErrorCode.IsDirectory,
        path: '/path/to/file',
      } as any,
      null,
    );

    t.ok(exc);
    t.equal(exc.message, 'Some file error');
    t.equal(exc.code, ErrorCode.IsDirectory);
    t.equal(exc.exitCode, ExitCode.IoError);
    t.same(exc.paths, ['/path/to/file']);
    t.equal(exc.traceback, null);
  });
}

describe('FileError', () => {
  test('when constructed directly', () => {
    const exc = new FileError(
      'Some file error',
      ErrorCode.Access,
      null,
      ['/path/to/file'],
      null,
    );

    t.ok(exc);
    t.equal(exc.message, 'Some file error');
    t.equal(exc.code, ErrorCode.Access);
    t.equal(exc.exitCode, ExitCode.OsError);
    t.same(exc.paths, ['/path/to/file']);
    t.equal(exc.traceback, null);
  });

  describe('when created from a naive error', () => {
    fileErrorTest('fromError', ExitCode.OsError);
  });

  describe('when created from a read error', () => {
    fileErrorTest('fromReadError', ExitCode.NoInput);
  });

  describe('when created from a write error', () => {
    fileErrorTest('fromWriteError', ExitCode.CantCreate);
  });
});
