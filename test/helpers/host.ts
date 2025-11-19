import * as consoleHost from '@matanuska/host';

import { Buffer } from 'node:buffer';
import { Transform, Writable } from 'node:stream';

import { expect } from 'vitest';

import stripAnsi from 'strip-ansi';

import { Host } from '../../host';
import { formatter } from '../../format';

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
export async function mockConsoleHost<T>(
  { files }: MockConsoleHostOptions = { files: FILES },
  fn: (host: MockConsoleHost) => Promise<T>,
): Promise<T> {
  consoleHost.setFormatter(formatter);

  const mockStdin = new MockInputStream();
  const mockStdout = new MockOutputStream();
  const mockStderr = new MockOutputStream();

  return await consoleHost.withIOStreams(
    mockStdin,
    mockStdout,
    mockStderr,
    async (): Promise<T> => {
      const host = Object.assign({}, consoleHost, {
        stdin: mockStdin,
        stdout: mockStdout,
        stderr: mockStderr,
        files: Object.fromEntries(
          Object.entries(files || {}).map(([path, contents]) => {
            return [consoleHost.resolvePath(path), contents];
          }),
        ),
        expectStart: 0,

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

      return await fn(host);
    },
  );
}
