import { Readable, Writable } from '@matanuska/internal';

import { Channel } from './channel';

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

  /**
   * Spawn a child process.
   *
   * @param process A spec for a process to spawn.
   * @param background When true, detach the process.
   */
  // spawn(process: ProcessSpec, background: boolean): ChildProcess;
}
