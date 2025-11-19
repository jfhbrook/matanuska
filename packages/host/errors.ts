export const ENOENT: string = 'ENOENT';
export const EACCES: string = 'EACCES';

export const EXIT_IOERROR = 74;
export const EXIT_NOINPUT = 66;
export const EXIT_CANTCREATE = 73;

export type HostErrorExceptionType = 'exception';
export type HostErrorExitType = 'exit';
export type HostErrorReadType = 'read';
export type HostErrorWriteType = 'write';
export type HostErrorType =
  | HostErrorExceptionType
  | HostErrorExitType
  | HostErrorReadType
  | HostErrorWriteType;

export interface HostError extends Error {
  __type__: HostErrorType;
  message: string;
}

export interface HostException extends HostError {
  __type__: HostErrorExceptionType;
}

export function hostException(message: string): HostException {
  const __type__: HostErrorExceptionType = 'exception';

  return Object.assign(new Error(message), { __type__ });
}

export function isHostException(err: any): err is HostException {
  if (err.__type__ !== 'exception') {
    return false;
  }

  return err instanceof Error;
}

export interface ExitError extends HostError {
  __type__: HostErrorExitType;
  exitCode: number;
}

export function exitError(exitCode: number): ExitError {
  const __type__: HostErrorExitType = 'exit';
  return Object.assign(new Error('ExitError'), { __type__, exitCode });
}

export function isHostExit(err: any): err is ExitError {
  if (typeof err.exitCode === 'undefined') {
    return false;
  }

  if (err.__type__ !== 'exit') {
    return false;
  }

  return err instanceof Error;
}

function getFileErrorMessage(err: NodeJS.ErrnoException): string {
  const split = err.message.split(': ');
  if (split.length === 2) {
    return split[1];
  }
  return err.message;
}

export interface FileReadError extends HostError {
  __type__: HostErrorReadType;
  code: string;
  exitCode?: number;
  path: string;
}

export interface FileReadErrorParams {
  message: string;
  code: string;
  exitCode?: number;
  path: string;
}

export function fileReadError(
  err: NodeJS.ErrnoException | FileReadErrorParams,
): FileReadError {
  const msg: string =
    err instanceof Error ? getFileErrorMessage(err) : err.message;
  const code: string = err.code || '<unknown>';
  let exitCode: number | undefined;

  if (code == EACCES) {
    exitCode = EXIT_NOINPUT;
  }

  const __type__: HostErrorReadType = 'read';
  const path = err.path;

  return Object.assign(new Error(msg), {
    __type__,
    code,
    exitCode,
    path,
  });
}

export function isFileReadError(err: any): err is FileReadError {
  if (typeof err.exitCode === 'undefined') {
    return false;
  }

  if (err.__type__ !== 'read') {
    return false;
  }

  if (typeof err.code !== 'string') {
    return false;
  }

  if (typeof err.paths !== 'string') {
    return false;
  }

  return err instanceof Error;
}

export interface FileWriteError extends HostError {
  __type__: HostErrorWriteType;
  code: string;
  exitCode?: number;
  path: string;
}

export function fileWriteError(err: NodeJS.ErrnoException): FileWriteError {
  const msg = getFileErrorMessage(err);
  const code: string = err.code || '<unknown>';
  let exitCode: number | undefined;

  if (code == EACCES) {
    exitCode = EXIT_CANTCREATE;
  }

  const __type__: HostErrorWriteType = 'write';
  const path: string = err.path;

  return Object.assign(new Error(msg), {
    __type__,
    code,
    exitCode,
    path,
  });
}

export function isFileWriteError(err: any): err is FileWriteError {
  if (err.__type__ !== 'write') {
    return false;
  }

  if (typeof err.code !== 'string') {
    return false;
  }

  if (typeof err.paths !== 'string') {
    return false;
  }

  return err instanceof Error;
}

export interface FileReadErrorParams {
  message: string;
  code: string;
  exitCode?: number;
  path: string;
}

type Channel = 0 | 1 | 2 | 3 | 4 | 5;

export function channelError(channel: Channel): FileWriteError {
  const __type__: HostErrorWriteType = 'write';

  return Object.assign(new Error(`Unknown channel: ${channel}`), {
    __type__,
    code: ENOENT,
    exitCode: EXIT_IOERROR,
    path: `#{channel}`,
  });
}
