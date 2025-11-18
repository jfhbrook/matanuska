import * as consoleHost from '@matanuska/host';
import { Channel, Level } from '@matanuska/host';

import { Buffer } from 'node:buffer';
import { Transform, Writable } from 'node:stream';

import { expect } from 'vitest';

import stripAnsi from 'strip-ansi';

import { Host } from '../../host';

import { EXAMPLES } from './files';

/**
 * An input stream for testing.
 */
export class MockInputStream extends Transform {
  public input: string;

  constructor() {
    super();
    this.input = '';
  }

  _transform(chunk: any, _encoding: any, callback: any) {
    if (chunk instanceof Buffer) {
      this.input += chunk.toString('utf8');
    } else {
      this.input += chunk;
    }
    this.push(chunk);
    callback();
  }

  reset() {
    this.input = '';
  }
}

/**
 * An output stream for testing.
 */
export class MockOutputStream extends Writable {
  output: string;

  constructor() {
    super();
    this.output = '';
  }

  _write(chunk: any, _encoding: string, callback: any) {
    if (chunk instanceof Buffer) {
      this.output += chunk.toString('utf8');
    } else {
      this.output += chunk;
    }
    callback();
  }

  reset() {
    this.output = '';
  }
}

export interface MockConsoleHostOptions {
  files?: Record<string, string>;
}

const FILES = Object.assign(
  {
    '/home/josh/.matbas_history': '',
  },
  EXAMPLES,
);

export interface MockConsoleHost extends Host {
  files: Record<string, string>;
  stdin: MockInputStream;
  stdout: MockOutputStream;
  stderr: MockOutputStream;
  expect: <T>(
    action: Promise<T>,
    input: string | null,
    expected: string,
    outputStream?: MockOutputStream | null,
  ) => Promise<T>;
}

/**
 * A mock console host.
 */
export function mockConsoleHost(
  { files }: MockConsoleHostOptions = { files: FILES },
): MockConsoleHost {
  const mockStdin = new MockInputStream();
  const mockStdout = new MockOutputStream();
  const mockStderr = new MockOutputStream();
  return Object.assign({}, consoleHost, {
    stdin: mockStdin,
    stdout: mockStdout,
    stderr: mockStderr,
    files: Object.fromEntries(
      Object.entries(files || {}).map(([path, contents]) => {
        return [consoleHost.resolvePath(path), contents];
      }),
    ),
    expectStart: 0,

    writeOut(value: any): void {
      this.stdout.write(`${value}`);
    },

    writeError(value: any): void {
      this.stderr.write(`${value}`);
    },

    writeLine(value: any): void {
      this.stdout.write(`${value}\n`);
    },

    writeErrorLine(value: any): void {
      this.stderr.write(`${value}\n`);
    },

    writeDebug(value: any): void {
      if (this.getLevel() <= Level.Debug) {
        this.stderr.write(`DEBUG: ${value}\n`);
      }
    },

    writeInfo(value: any): void {
      if (this.getLevel() <= Level.Info) {
        this.stderr.write(`INFO: ${value}\n`);
      }
    },

    writeWarn(value: any): void {
      if (this.getLevel() <= Level.Warn) {
        this.stderr.write(`WARN: ${value}\n`);
      }
    },

    writeException(value: any): void {
      let exc: any = value;
      if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      ) {
        exc = new Error(String(value));
      }

      this.stderr.write(`${exc}\n`);
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
          throw new Error(`#${channel}`);
      }
    },

    async expect<T>(
      action: Promise<T>,
      input: string | null,
      expected: string,
      outputStream: MockOutputStream | null = null,
    ): Promise<T> {
      outputStream = outputStream || this.stdout;

      if (input) {
        this.inputStream.write(`${input}\n`);
      }

      const rv = await action;

      let output = stripAnsi(this.stdout.output);
      const expectStart = this.expectStart;
      this.expectStart = output.length;
      output = output.slice(expectStart);

      expect(output, `expect: ${expected}`).toMatch(expected);

      return rv;
    },

    hostname(): string {
      return 'gibson.local';
    },

    tty(): string | null {
      return 'tty0';
    },

    shell(): string {
      return 'matbas';
    },

    now(): Date {
      // TODO: Because I'm not handling time zones at all, tests using this
      // only past in Alaska in the summer.
      return new Date('23 Jun 2024 13:00:00 PST');
    },

    uid(): number {
      return 1000;
    },

    gid(): number {
      return 50;
    },

    username(): string {
      return 'josh';
    },

    homedir(): string {
      return '/home/josh';
    },

    async readTextFile(filename: string): Promise<string> {
      const contents = this.files[this.resolvePath(filename)];
      expect(contents).not.toBeUndefined();
      return contents;
    },

    async writeTextFile(filename: string, contents: string): Promise<void> {
      this.files[this.resolvePath(filename)] = contents;
    },
  });
}
