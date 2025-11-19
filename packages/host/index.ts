import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { hostname, userInfo, homedir } from 'node:os';
import { stdin, stdout, stderr, platform, cwd, env, argv } from 'node:process';
import { Readable, Writable, Transform } from 'node:stream';
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
import { Formatter } from './format';
import { Level } from './level';

export {
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
  HostError,
  HostException,
  ExitError,
  FileReadError,
  FileWriteError,
};

/**
 * An interface that encapsulates platform specific behavior. This includes:
 *
 * - Standard IO streams
 * - "Ground floor" logging
 * - IO for files and custom channels
 * - Process management
 * - Networking and other ports
 */
export interface Host {
  /**
   * Node.js compatible command line arguments
   */
  argv: string[];

  /**
   * Node.js compatible environment variables
   */
  env: Record<string, string | undefined>;

  /**
   * Node.js compatible platform string. Possible values are 'aix', 'darwin',
   * 'freebsd', 'linux', 'openbsd', 'sunos' and 'win32'.
   */
  platform: string;

  /**
   * The OS's hostname.
   */
  hostname: () => string;

  /**
   * The current user's home directory.
   */
  homedir: () => string;

  /**
   * The current logging level. Used to suppress debug, info and warning
   * messages.
   */
  level: Level;

  /**
   * The Formatter used when logging.
   */
  formatter: Formatter;

  /**
   * Write a value to the output channel, without a newline.
   *
   * @param value The value to write.
   */
  writeOut(value: any): void;

  /**
   * Write a value to the error channel, without a newline.
   *
   * @param value The value to write.
   */
  writeError(value: any): void;

  /**
   * Write a value to the output channel, with a newline.
   *
   * @param value The value to write.
   */
  writeLine(value: any): void;

  /**
   * Write a value to the error channel, without a newline.
   *
   * @param value The value to write.
   */
  writeErrorLine(value: any): void;

  /**
   * Write a value to the debug channel. If the log level is not inclusive of
   * Debug, no output is written.
   *
   * @param value The value to write.
   */
  writeDebug(value: any): void;

  /**
   * Write a value to the info channel. If the log level is not inclusive of
   * Info, no output is written.
   *
   * @param value The value to write.
   */
  writeInfo(value: any): void;

  /**
   * Write a value to the warn channel. If the log level is not inclusive of
   * Warn, no output is written.
   *
   * @param value The value to write.
   */
  writeWarn(value: any): void;

  /**
   * Write an Exception to the error channel.
   *
   * @param exception The exception to write.
   */
  writeException(value: any): void;

  /**
   * Write a value to a numbered channel.
   *
   * @param channel The channel to write to.
   * @param value The value to write.
   */
  writeChannel(channel: Channel, value: any): void;

  /**
   * Exit the process.
   *
   * @param code The exit code.
   */
  exit(code: number): void;

  /**
   * The OS's tty (if available).
   */
  tty(): string | null;

  /**
   * The basename of Matanuska BASIC's entry point script. This is a decent
   * approximation for the shell command as invoked.
   */
  shell: string;

  /**
   * The current date and time.
   */
  now(): Date;

  /**
   * The current user's uid.
   */
  uid(): number;

  /**
   * The current user's gid.
   */
  gid(): number;

  /**
   * The current user's username.
   */
  username(): string;

  /**
   * Change the shell's current working directory.
   *
   * @param path The path to change the directory to.
   */
  cd(path: string): void;

  /**
   * Shows the shell's current working directory.
   *
   * @param follow Whether or not to follow symlinks.
   */
  pwd(follow: boolean): string;

  /**
   * Resolve a relative path into a full path.
   *
   * @param path A relative path.
   * @returns The absolute path.
   */
  resolvePath(path: string): string;

  /**
   * Return a path relative to the current working directory.
   *
   * @param from The path the output is relative to, itself relative to the
   *             current working directory.
   * @param to The path to get the relative path for.
   * @returns The relative path.
   */
  relativePath(from: string, to: string): string;

  /**
   * Read a file from disk.
   *
   * @param filename The path to the file.
   * @returns The contents of the file.
   */
  readTextFile(filename: string): Promise<string>;

  /**
   * Write a file to disk.
   *
   * @param filename The path to the file.
   * @param contents The contents of the file.
   */
  writeTextFile(filename: string, contents: string): Promise<void>;

  /**
   * Spawn a child process.
   *
   * @param process A spec for a process to spawn.
   * @param background When true, detach the process.
   */
  // spawn(process: ProcessSpec, background: boolean): ChildProcess;
}

export interface ConsoleHost extends Host {
  _tty: string | null | undefined;
  _cwd: string;

  /**
   * Node.js compatible object inspector.
   */
  inspect: typeof inspect;

  /**
   * Node.js standard IO streams. Required for readline.
   */
  stdin: Readable;
  stdout: Writable;
  stderr: Writable;
}

export const host: ConsoleHost = {
  argv,
  env,
  platform,
  hostname,
  homedir,
  level: Level.Info,
  _tty: undefined,
  _cwd: cwd(),
  formatter: {
    format(obj: any): string {
      return inspect(obj);
    },
  },
  inspect,
  stdin,
  stdout,
  stderr,
  writeOut(value: any): void {
    this.stdout.write(this.formatter.format(value));
  },
  writeError(value: any): void {
    this.stderr.write(this.formatter.format(value));
  },

  writeLine(value: any): void {
    this.stdout.write(`${this.formatter.format(value)}\n`);
  },

  writeErrorLine(value: any): void {
    this.stderr.write(`${this.formatter.format(value)}\n`);
  },

  writeDebug(value: any): void {
    if (this.level <= Level.Debug) {
      this.stderr.write(`DEBUG: ${this.formatter.format(value)}\n`);
    }
  },

  writeInfo(value: any): void {
    if (this.level <= Level.Info) {
      this.stderr.write(`INFO: ${this.formatter.format(value)}\n`);
    }
  },

  writeWarn(value: any): void {
    if (this.level <= Level.Warn) {
      this.stderr.write(`WARN: ${this.formatter.format(value)}\n`);
    }
  },

  writeException(value: any): void {
    let exc: any = value;
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      exc = hostException(this.formatter.format(value));
    }

    this.stderr.write(`${this.formatter.format(exc)}\n`);
  },

  writeChannel(channel: Channel, value: any): void {
    switch (channel) {
      case 1:
        this.writeOut(value);
        break;
      case 2:
        this.writeError(value);
        break;
      case 3:
        this.writeWarn(value);
        break;
      case 4:
        this.writeInfo(value);
        break;
      case 5:
        this.writeDebug(value);
        break;
      default:
        throw channelError(channel);
    }
  },

  //
  // OS and environment concerns.
  //

  exit(exitCode: number): any {
    throw exitError(exitCode);
  },

  tty(): string | null {
    if (typeof this._tty === 'undefined') {
      try {
        // I'm running this synronously because I assume it will be a quick
        // process and that it will only need to run once (since a process's
        // TTY never changes).
        const { stdout } = spawnSync('tty');
        this._tty = stdout.toString().trim();
      } catch (_err) {
        // I'm assuming that if this fails, it's because it ultimately doesn't
        // make sense to ascribe a TTY to the process. But it would be nice
        // to have tracing for this, in some capacity.
        this._tty = null;
      }
    }

    return this._tty;
  },

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

  shell: env.__MATBAS_DOLLAR_ZERO || PATH.basename(argv[1]),

  // TODO: JavaScript Dates aren't very good. Is there a sensible replacement?
  // TODO: Can we control locale-awareness better?
  now(): Date {
    return new Date();
  },

  uid(): number {
    return userInfo().uid;
  },

  gid(): number {
    return userInfo().gid;
  },

  username(): string {
    return userInfo().username;
  },

  pwd(_follow: boolean): string {
    // TODO: implement follow/no-follow
    return this._cwd;
  },

  cd(path: string): void {
    if (path === '') {
      this._cwd = this.homedir();
      return;
    }
    // TODO: `-` changes to previous path
    this._cwd = this.resolvePath(path);
  },

  resolvePath(p: string): string {
    p = p.replace(/^~\//, this.homedir() + '/');
    if (p.startsWith('/') || p.startsWith('\\')) {
      return p;
    }
    return PATH.resolve(PATH.join(this._cwd, p));
  },

  relativePath(from: string, to: string): string {
    return PATH.relative(this.resolvePath(from), this.resolvePath(to));
  },

  async readTextFile(filename: string): Promise<string> {
    try {
      return await readFile(this.resolvePath(filename), 'utf8');
    } catch (err) {
      throw fileReadError(err);
    }
  },

  async writeTextFile(filename: string, contents: string): Promise<void> {
    try {
      await writeFile(this.resolvePath(filename), contents, 'utf8');
    } catch (err) {
      throw fileWriteError(err);
    }
  },

  /*
  spawn(process: ProcessSpec, background: boolean): ChildProcess {
    return spawn.apply(spawn, nodeSpawnArguments(process, background));
  }
  */
};
