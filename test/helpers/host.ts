import { expect } from 'vitest';

// TODO: strip-ansi v7+ uses .mjs, which completely breaks in typescript if
// you're compiling imports to commonjs, lolsob
import stripAnsi from 'strip-ansi';

import { Buffer } from 'node:buffer';
import { Transform, Writable } from 'node:stream';

import { ConsoleHost } from '../../host';

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

/**
 * A subclass of ConsoleHost with test streams.
 */
export class MockConsoleHost extends ConsoleHost {
  declare inputStream: MockInputStream;
  declare outputStream: MockOutputStream;
  declare errorStream: MockOutputStream;
  public files: Record<string, string>;
  private expectStart: number;

  constructor({ files }: MockConsoleHostOptions = { files: FILES }) {
    super();
    this.inputStream = new MockInputStream();
    this.outputStream = new MockOutputStream();
    this.errorStream = new MockOutputStream();
    this.cwd = '/home/josh/matanuska';
    this.files = Object.fromEntries(
      Object.entries(files || {}).map(([path, contents]) => {
        return [this.resolvePath(path), contents];
      }),
    );
    this.expectStart = 0;
  }

  async expect<T>(
    action: Promise<T>,
    input: string | null = null,
    expected: string,
    outputStream: MockOutputStream | null = null,
  ): Promise<T> {
    outputStream = outputStream || this.outputStream;

    if (input) {
      this.inputStream.write(`${input}\n`);
    }

    const rv = await action;

    let output = stripAnsi(outputStream.output);
    const expectStart = this.expectStart;
    this.expectStart = output.length;
    output = output.slice(expectStart);

    expect(output, `expect: ${expected}`).toMatch(expected);

    return rv;
  }

  hostname(): string {
    return 'gibson.local';
  }

  tty(): string | null {
    return 'tty0';
  }

  shell(): string {
    return 'matbas';
  }

  now(): Date {
    // TODO: Because I'm not handling time zones at all, tests using this
    // only past in Alaska in the summer.
    return new Date('23 Jun 2024 13:00:00 PST');
  }

  uid(): number {
    return 1000;
  }

  gid(): number {
    return 50;
  }

  username(): string {
    return 'josh';
  }

  homedir(): string {
    return '/home/josh';
  }

  async readFile(filename: string): Promise<string> {
    const contents = this.files[this.resolvePath(filename)];
    expect(contents).not.toBeUndefined();
    return contents;
  }

  async writeFile(filename: string, contents: string): Promise<void> {
    this.files[this.resolvePath(filename)] = contents;
  }
}
