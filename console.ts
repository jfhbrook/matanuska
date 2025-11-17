import {
  hostname,
  userInfo,
  homedir,
  spawnSync,
  readFile,
  writeFile,
  stdin,
  stdout,
  stderr,
  Readable,
  Writable,
} from '@matanuska/internal';
// import { spawn, spawnSync, ChildProcess } from '@matanuska/internal';

import { Channel } from './channel';
import { ErrorCode } from './errors';
import { BaseException, FileError } from './exceptions';
import { Exit, ExitCode } from './exit';
import { DefaultFormatter } from './format';
import * as path from './vendor/path';
// import { ProcessSpec, nodeSpawnArguments } from './process';

import { Host, Level } from './host';

/**
 * A host for a standard terminal console.
 */
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
    return hostname();
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
    return userInfo().uid;
  }

  gid(): number {
    return userInfo().gid;
  }

  username(): string {
    return userInfo().username;
  }

  homedir(): string {
    return homedir();
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

  /*
  spawn(process: ProcessSpec, background: boolean): ChildProcess {
    return spawn.apply(spawn, nodeSpawnArguments(process, background));
  }
  */
}
