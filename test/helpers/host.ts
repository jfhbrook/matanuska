import { Test } from 'tap';

import { Buffer } from 'buffer';
import { Transform, Writable } from 'stream';

import { ConsoleHost } from '../../host';

/**
 * An input stream for testing.
 */
export class MockInputStream extends Transform {
  input: string;

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

/**
 * A subclass of ConsoleHost with test streams.
 */
export class MockConsoleHost extends ConsoleHost {
  declare inputStream: MockInputStream;
  declare outputStream: MockOutputStream;
  declare errorStream: MockOutputStream;

  constructor() {
    super();
    this.inputStream = new MockInputStream();
    this.outputStream = new MockOutputStream();
    this.errorStream = new MockOutputStream();
  }

  async expect<T>(
    t: Test,
    action: Promise<T>,
    input: string,
    outputStream: MockOutputStream | null = null,
  ): Promise<T> {
    outputStream = outputStream || this.outputStream;

    this.inputStream.write(`${input}\n`);

    const rv = await action;

    t.matchSnapshot(outputStream.output);

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
    return '/Users/josh';
  }

  cwd(): string {
    return '/Users/josh/Software/jfhbrook/matanuska';
  }
}
