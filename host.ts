import type {
  Host,
  ConsoleHost,
  Channel,
  StdChannel,
  Level,
  Readable,
  Writable,
  Transform,
  HostException,
  ExitError,
  FileReadError,
  FileWriteError,
} from '@matanuska/host';

import { host as baseHost } from '@matanuska/host';
import {
  INPUT,
  OUTPUT,
  ERROR,
  WARN,
  INFO,
  DEBUG,
  stdChannel,
  hostException,
  exitError,
  fileReadError,
  fileWriteError,
  channelError,
  isHostException,
  isHostExit,
  isFileReadError,
  isFileWriteError,
} from '@matanuska/host';

import { formatter } from './format';
import { Exit } from './exit';
import { FileError } from './exceptions';

export const host: ConsoleHost = {
  ...baseHost,
  formatter: formatter,

  writeChannel(channel: Channel, value: any): void {
    try {
      baseHost.writeChannel.call(this, channel, value);
    } catch (err: any) {
      if (isFileWriteError(err)) {
        throw new FileError(
          err.message,
          err.code,
          err.exitCode || null,
          [err.path],
          null,
        );
      }
      throw err;
    }
  },

  exit(exitCode: number): any {
    try {
      baseHost.exit.call(this, exitCode);
    } catch (err: any) {
      if (isHostExit(err)) {
        throw new Exit(err.exitCode, err.message);
      }
      throw err;
    }
  },

  async readTextFile(filename: string): Promise<string> {
    try {
      return await baseHost.readTextFile.call(this, filename);
    } catch (err) {
      if (isFileReadError(err)) {
        throw new FileError(
          err.message,
          err.code,
          err.exitCode || null,
          [err.path],
          null,
        );
      }

      throw err;
    }
  },

  async writeTextFile(filename: string, contents: string): Promise<void> {
    try {
      return await baseHost.writeTextFile.call(this, filename, contents);
    } catch (err) {
      if (isFileWriteError(err)) {
        throw new FileError(
          err.message,
          err.code,
          err.exitCode || null,
          [err.path],
          null,
        );
      }

      throw err;
    }
  },
};

export {
  Host,
  ConsoleHost,
  Readable,
  Writable,
  Transform,
  Level,
  INPUT,
  OUTPUT,
  ERROR,
  WARN,
  INFO,
  DEBUG,
  stdChannel,
  hostException,
  exitError,
  fileReadError,
  fileWriteError,
  channelError,
  isHostException,
  isHostExit,
  isFileReadError,
  isFileWriteError,
};

export type {
  StdChannel,
  Channel,
  HostException,
  ExitError,
  FileReadError,
  FileWriteError,
};
