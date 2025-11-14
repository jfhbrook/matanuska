import { readFile, writeFile } from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { spawnSync } from 'child_process';
import { stdin, stdout, stderr } from 'node:process';
import { Readable, Writable } from 'stream';

import { Injectable } from '@nestjs/common';

import { ErrorCode } from './errors';
import { BaseException, FileError } from './exceptions';
import { Exit, ExitCode } from './exit';
import { DefaultFormatter } from './format';

/**
 * A logging level.
 */
export enum Level {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3,
}

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
  //
  // Ground floor I/O. IO is exposed as stdio streams so that lower level
  // components (like readline) can use them directly.
  //

  /**
   * The standard input stream.
   */
  inputStream: Readable;

  /**
   * The standard output stream.
   */
  outputStream: Writable;

  /**
   * The standard error stream.
   */
  errorStream: Writable;

  //
  // Logging concerns. It's arguable these shouldn't be the Host's problem,
  // but it needs to work at the ground floor, so we do it here.
  //

  /**
   * The current logging level. Used to suppress debug, info and warning
   * messages.
   */
  level: Level;

  /**
   * Set the current logging level.
   *
   * @param level The new logging level.
   */
  setLevel(level: Level): void;

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
   * Write a value to a numbered channel. The standard channels are:
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
   * @param channel The channel to write to.
   * @param value The value to write.
   */
  writeChannel(channel: number, value: any): void;

  /**
   * Exit the process.
   *
   * @param code The exit code.
   */
  exit(code: number): void;

  /**
   * The OS's hostname.
   */
  hostname(): string;

  /**
   * The OS's tty (if available).
   */
  tty(): string | null;

  /**
   * The basename of Matanuska BASIC's entry point script. This is a decent
   * approximation for the shell command as invoked.
   */
  shell(): string;

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
   * The current user's home directory.
   */
  homedir(): string;

  /**
   * The shell's current working directory. This is not the same as the
   * process's current working directory.
   */
  cwd: string;

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
  pwd(follow: boolean): void;

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
  readFile(filename: string): Promise<string>;

  /**
   * Write a file to disk.
   *
   * @param filename The path to the file.
   * @param contents The contents of the file.
   */
  writeFile(filename: string, contents: string): Promise<void>;
}

/**
 * A host for a standard terminal console.
 */
@Injectable()
export class ConsoleHost implements Host {
  private formatter = new DefaultFormatter();
  inputStream: Readable;
  outputStream: Writable;
  errorStream: Writable;
  level: Level = Level.Info;

  private _tty: string | null | undefined = undefined;

  public cwd: string = process.cwd();

  constructor() {
    this.inputStream = stdin;
    this.outputStream = stdout;
    this.errorStream = stderr;
  }

  setLevel(level: Level): void {
    this.level = level;
  }

  writeOut(value: any): void {
    this.outputStream.write(this.formatter.format(value));
  }

  writeError(value: any): void {
    this.errorStream.write(this.formatter.format(value));
  }

  writeLine(value: any): void {
    this.outputStream.write(`${this.formatter.format(value)}\n`);
  }

  writeErrorLine(value: any): void {
    this.errorStream.write(`${this.formatter.format(value)}\n`);
  }

  writeDebug(value: any): void {
    if (this.level <= Level.Debug) {
      this.errorStream.write(`DEBUG: ${this.formatter.format(value)}\n`);
    }
  }

  writeInfo(value: any): void {
    if (this.level <= Level.Info) {
      this.errorStream.write(`INFO: ${this.formatter.format(value)}\n`);
    }
  }

  writeWarn(value: any): void {
    if (this.level <= Level.Warn) {
      this.errorStream.write(`WARN: ${this.formatter.format(value)}\n`);
    }
  }

  writeException(value: any): void {
    let exc = value;
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      exc = new BaseException(String(value), null);
    }

    this.errorStream.write(`${this.formatter.format(exc)}\n`);
  }

  writeChannel(channel: number, value: any): void {
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
        throw new FileError(
          `Unknown channel: ${channel}`,
          ErrorCode.NoEntity,
          ExitCode.IoError,
          [`#${channel}`],
          null,
        );
    }
  }

  //
  // OS and environment concerns.
  //

  exit(exitCode: number): void {
    throw new Exit(exitCode);
  }

  hostname(): string {
    return os.hostname();
  }

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
  shell(): string {
    if (process.env.__MATBAS_DOLLAR_ZERO) {
      return process.env.__MATBAS_DOLLAR_ZERO;
    }
    return path.basename(process.argv[1]);
  }

  // TODO: JavaScript Dates aren't very good. Is there a sensible replacement?
  // TODO: Can we control locale-awareness better?
  now(): Date {
    return new Date();
  }

  uid(): number {
    return os.userInfo().uid;
  }

  gid(): number {
    return os.userInfo().gid;
  }

  username(): string {
    return os.userInfo().username;
  }

  homedir(): string {
    return os.homedir();
  }

  // See: https://en.wikipedia.org/wiki/Cd_(command)
  cd(path: string): void {
    if (path === '') {
      this.cwd = this.homedir();
      return;
    }
    // TODO: `-` changes to previous path
    this.cwd = this.resolvePath(path);
  }

  // See: https://en.wikipedia.org/wiki/Pwd
  pwd(_follow: boolean): string {
    // TODO: implement follow/no-follow
    return this.cwd;
  }

  resolvePath(p: string): string {
    p = p.replace(/^~\//, this.homedir() + '/');
    if (p.startsWith('/') || p.startsWith('\\')) {
      return p;
    }
    return path.resolve(path.join(this.cwd, p));
  }

  relativePath(from: string, to: string): string {
    return path.relative(this.resolvePath(from), this.resolvePath(to));
  }

  async readFile(filename: string): Promise<string> {
    try {
      return await readFile(this.resolvePath(filename), 'utf8');
    } catch (err) {
      throw FileError.fromReadError(null, err);
    }
  }

  async writeFile(filename: string, contents: string): Promise<void> {
    try {
      await writeFile(this.resolvePath(filename), contents, 'utf8');
    } catch (err) {
      throw FileError.fromWriteError(null, err);
    }
  }
}
