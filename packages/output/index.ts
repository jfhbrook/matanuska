/**
 * Channels are a superset of StdIO streams, inspired by PowerShell's streams.
 * The supported channels are:
 *
 * 1 - Output
 * 2 - Error
 * 3 - Warn
 * 4 - Info
 * 5 - Debug
 *
 * Channels 1 and 2 correspond to stdout and stderr, respectively.
 * Channels 3-5 are treated as logging methods.
 *
 * In the future, custom channels may be supported as an abstraction over
 * file descriptors.
 *
 */

export const INPUT = 0;
export const OUTPUT = 1;
export const INFO = 4;
export const WARN = 3;
export const DEBUG = 5;
export const ERROR = 2;

export type StdChannel = 0 | 1 | 2;
export type Channel = 0 | 1 | 2 | 3 | 4 | 5;

export function stdChannel(channel: Channel): StdChannel {
  switch (channel) {
    case INPUT:
    case OUTPUT:
    case ERROR:
      return channel;
    default:
      return ERROR;
  }
}

/**
 * A logging LEVEL.
 */
export enum Level {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3,
}
