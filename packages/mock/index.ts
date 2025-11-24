import { host, ConsoleHost, Transform, Writable, Buffer } from '@matanuska/host';
import { Prompt, Readline } from '@matanuska/readline';

// TODO: Integrate @matanuska/test
import { expect } from 'vitest';

/**
 * Vendored from strip-ansi and ansi-regex by Sindre Sorhus. Modified by
 * Josh Holbrook to be bundled and in TypeScript.
 *
 * Both are licensed under an MIT license, which may be viewed here:
 *
 *     https://github.com/chalk/strip-ansi/blob/c51e2883f3579628f7bffd40a13070e563bcc2c6/license
 *     https://github.com/chalk/ansi-regex/blob/94983fc6ba00e1e9657f72c07eb7b9c75e4011a2/license
 *
 */

type RegexOptions = {
  readonly onlyFirst: boolean;
};

function ansiRegex({ onlyFirst }: RegexOptions = { onlyFirst: false }) {
  // Valid string terminator sequences are BEL, ESC\, and 0x9c
  const ST = '(?:\\u0007|\\u001B\\u005C|\\u009C)';

  // OSC sequences only: ESC ] ... ST (non-greedy until the first ST)
  const osc = `(?:\\u001B\\][\\s\\S]*?${ST})`;

  // CSI and related: ESC/C1, optional intermediates, optional params (supports ; and :) then final byte
  const csi =
    '[\\u001B\\u009B][[\\]()#;?]*(?:\\d{1,4}(?:[;:]\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]';

  const pattern = `${osc}|${csi}`;

  return new RegExp(pattern, onlyFirst ? undefined : 'g');
}

const regex = ansiRegex();

function stripAnsi(string: string): string {
  if (typeof string !== 'string') {
    throw new TypeError(`Expected a \`string\`, got \`${typeof string}\``);
  }

  // Even though the regex is global, we don't need to reset the `.lastIndex`
  // because unlike `.exec()` and `.test()`, `.replace()` does it automatically
  // and doing it manually has a performance penalty.
  return string.replace(regex, '');
}

/**
 * OK, back to regularly scheduled programming!
 */

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
