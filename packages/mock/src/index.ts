import { host, ConsoleHost, Transform, Writable, Buffer } from '@matanuska/host';
import { Prompt, Readline } from '@matanuska/readline';

// TODO: Integrate @matanuska/test
import { expect } from 'vitest';

// TODO: vendor strip-ansi
import stripAnsi from '../../../vendor/strip-ansi';

/**
 * File mocks
 */
type FullPath = string;
type Contents = string;
type Files = Record<FullPath, Contents>;

export const FILES: Files = {
  '/home/josh/.matbas_history': '',
  '/home/josh/script.bas': '100 print "hello world!"',
};

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

export interface MockConsoleHost extends ConsoleHost {
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

export function mockHost(
  host_: ConsoleHost = host,
  files: Files = FILES,
): MockConsoleHost {
  const stdin = new MockInputStream();
  const stdout = new MockOutputStream();
  const stderr = new MockOutputStream();

  const mockHost = {
    ...host_,
    stdin,
    stdout,
    stderr,
    _cwd: '/home/josh/matanuska',

    files: {},
    _files() {
      return Object.fromEntries(
        Object.entries(files || {}).map(([path, contents]) => {
          return [this.path.resolve(path), contents];
        }),
      );
    },

    async expect<T>(
      action: Promise<T>,
      input: string | null,
      expected: string,
      outputStream: MockOutputStream | null = null,
    ): Promise<T> {
      const stream = outputStream || this.stdout;

      if (input) {
        this.stdin.write(`${input}\n`);
      }

      const rv = await action;

      let output = stripAnsi(stream.output);
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

    shell: 'matbas',

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
      const contents = this.files[this.path.resolve(filename)];
      expect(contents).not.toBeUndefined();
      return contents;
    },

    async writeTextFile(filename: string, contents: string): Promise<void> {
      this.files[this.path.resolve(filename)] = contents;
    },
  };

  mockHost.path.resolve = host._resolvePath.bind(mockHost);
  mockHost.path.relative = host._relativePath.bind(mockHost);
  mockHost.files = mockHost._files();

  return mockHost;
}

export const mockPs1: Prompt = {
  render() {
    return '> ';
  }
}

export class MockReadline extends Readline {
  public stdin: MockInputStream;
  public stdout: MockOutputStream;

  constructor(host: MockConsoleHost) {
    super(host, mockPs1, 100, 100);

    this.stdin = host.stdin;
    this.stdout = host.stdout;
  }

  get historyFile(): string {
    return './.matbas_history';
  }
}

export async function mockReadline(host: MockConsoleHost, fn: (readline: MockReadline) => Promise<void>): Promise<void> {
  const readline = new MockReadline(host);

  await readline.using(async () => {
    await fn(readline);
  });
}
