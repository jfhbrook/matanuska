import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { hostname, userInfo, homedir } from 'node:os';
import { stdin, stdout, stderr, platform, cwd, env, argv } from 'node:process';
import { Readable, Writable } from 'node:stream';
import { inspect } from 'node:util';
import * as PATH from 'node:path';

import type { StdChannel, Channel } from './channel';

import { INPUT, OUTPUT, ERROR, WARN, INFO, DEBUG, stdChannel } from './channel';

import {
  HostError,
  HostException,
  isHostException,
  ExitError,
  isHostExit,
  FileReadError,
  isFileReadError,
  FileWriteError,
  isFileWriteError,
  hostException,
  exitError,
  fileReadError,
  fileWriteError,
  channelError,
} from './errors';

export {
  argv,
  env,
  platform,
  hostname,
  homedir,
  inspect,
  stdin,
  stdout,
  stderr,
  Readable,
  Writable,
};

export type { StdChannel, Channel };

export { INPUT, OUTPUT, ERROR, WARN, INFO, DEBUG, stdChannel };

export type {
  HostError,
  HostException,
  ExitError,
  FileReadError,
  FileWriteError,
};

export { isHostException, isHostExit, isFileReadError, isFileWriteError };

/**
 * A logging LEVEL.
 */
export enum Level {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3,
}

export interface HostFormatter {
  format: (obj: any) => string;
}

let LEVEL: Level = Level.Info;

let TTY: string | null | undefined = undefined;

let CWD: string = cwd();

let FORMATTER: HostFormatter = {
  format(obj: any): string {
    return inspect(obj);
  },
};

export function setLevel(lvl: Level): void {
  LEVEL = lvl;
}

export function getLevel(): Level {
  return LEVEL;
}

export function setFormatter(formatter: HostFormatter): void {
  FORMATTER = formatter;
}

let STDIN: Readable = stdin;
let STDOUT: Writable = stdout;
let STDERR: Writable = stderr;

// For testing

type IOStreamsContext<T> = () => Promise<T>;

export async function withIOStreams<T>(
  stdin: Readable,
  stdout: Writable,
  stderr: Writable,
  fn: IOStreamsContext<T>,
): Promise<T> {
  const _stdin = STDIN;
  const _stdout = STDOUT;
  const _stderr = STDERR;

  STDIN = stdin;
  STDOUT = stdout;
  STDERR = stderr;

  const ret = await fn();

  STDIN = _stdin;
  STDOUT = _stdout;
  STDERR = _stderr;

  return ret;
}

export function writeOut(value: any): void {
  STDOUT.write(FORMATTER.format(value));
}

export function writeError(value: any): void {
  STDERR.write(FORMATTER.format(value));
}

export function writeLine(value: any): void {
  STDOUT.write(`${FORMATTER.format(value)}\n`);
}

export function writeErrorLine(value: any): void {
  STDERR.write(`${FORMATTER.format(value)}\n`);
}

export function writeDebug(value: any): void {
  if (LEVEL <= Level.Debug) {
    STDERR.write(`DEBUG: ${FORMATTER.format(value)}\n`);
  }
}

export function writeInfo(value: any): void {
  if (LEVEL <= Level.Info) {
    STDERR.write(`INFO: ${FORMATTER.format(value)}\n`);
  }
}

export function writeWarn(value: any): void {
  if (LEVEL <= Level.Warn) {
    STDERR.write(`WARN: ${FORMATTER.format(value)}\n`);
  }
}

export function writeException(value: any): void {
  let exc: any = value;
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    exc = hostException(FORMATTER.format(value));
  }

  STDERR.write(`${FORMATTER.format(exc)}\n`);
}

export function writeChannel(channel: Channel, value: any): void {
  switch (channel) {
    case 1:
      writeOut(value);
      break;
    case 2:
      writeError(value);
      break;
    case 3:
      writeWarn(value);
      break;
    case 4:
      writeInfo(value);
      break;
    case 5:
      writeDebug(value);
      break;
    default:
      throw channelError(channel);
  }
}

//
// OS and environment concerns.
//

export function exit(exitCode: number): any {
  throw exitError(exitCode);
}

export function tty(): string | null {
  if (typeof TTY === 'undefined') {
    try {
      // I'm running this synronously because I assume it will be a quick
      // process and that it will only need to run once (since a process's
      // TTY never changes).
      const { stdout } = spawnSync('tty');
      TTY = stdout.toString().trim();
    } catch (_err) {
      // I'm assuming that if this fails, it's because it ultimately doesn't
      // make sense to ascribe a TTY to the process. But it would be nice
      // to have tracing for this, in some capacity.
      TTY = null;
    }
  }

  return TTY;
}

// A best attempt at the raw arguments to the command (ie. $0 in Bash). In
// Bash (or a C program), you would have this behavior:
//
// - `bash` -> $0 is `bash`
// - `$(which bash)` -> $0 is `/usr/bin/bash`
//
// Node.js does a bunch of processing to process.argv, such that the first
// two arguments are *always* `node` and the path to the script,
// respectively.
//
// There isn't a good portable way to get at the "original" argv from
// Node.js. There are a few approaches:
//
// 1. Write a wrapper script in Bash that reads $0 directly, puts it in an
//    environment variable, and then execs node.
// 2. Write a wrapper in C++ (or Rust) that does something similar, but
//    embeds Node.
//
// This works, for now, by doing the former. See ./bin/matbas for details.
// But the latter could be compelling later, especially if I decide to
// use rollup to build a bundle - if I embed the source build and Node
// itself, then I'll have a static binary with no assets.
//
// As a fallback, just grab the basename of process.argv[1]. In most cases
// it will be incorrect, but it's better than nothing.

export const shell: string = env.__MATBAS_DOLLAR_ZERO || PATH.basename(argv[1]);

// TODO: JavaScript Dates aren't very good. Is there a sensible replacement?
// TODO: Can we control locale-awareness better?
export function now(): Date {
  return new Date();
}

export function uid(): number {
  return userInfo().uid;
}

export function gid(): number {
  return userInfo().gid;
}

export function username(): string {
  return userInfo().username;
}

export function pwd(_follow: boolean): string {
  // TODO: implement follow/no-follow
  return CWD;
}

export function cd(path: string): void {
  if (path === '') {
    CWD = homedir();
    return;
  }
  // TODO: `-` changes to previous path
  CWD = resolvePath(path);
}

export function resolvePath(p: string): string {
  p = p.replace(/^~\//, homedir() + '/');
  if (p.startsWith('/') || p.startsWith('\\')) {
    return p;
  }
  return PATH.resolve(PATH.join(CWD, p));
}

export function relativePath(from: string, to: string): string {
  return PATH.relative(resolvePath(from), resolvePath(to));
}

export async function readTextFile(filename: string): Promise<string> {
  try {
    return await readFile(resolvePath(filename), 'utf8');
  } catch (err) {
    throw fileReadError(err);
  }
}

export async function writeTextFile(
  filename: string,
  contents: string,
): Promise<void> {
  try {
    await writeFile(resolvePath(filename), contents, 'utf8');
  } catch (err) {
    throw fileWriteError(err);
  }
}

/*
spawn(process: ProcessSpec, background: boolean): ChildProcess {
  return spawn.apply(spawn, nodeSpawnArguments(process, background));
}
*/
