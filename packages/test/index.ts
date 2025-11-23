export type AssertionType =
  | 'fail'
  | 'pass'
  | 'ok'
  | 'notOk'
  | 'error'
  | 'equal'
  | 'notEqual'
  | 'deepEqual'
  | 'deepNotEqual'
  | 'throws'
  | 'doesNotThrow'
  | 'rejects'
  | 'resolves'
  | 'match'
  | 'doesNotMatch';

export interface Assertion {
  path: string[];
  type: AssertionType;
  actual: any;
  expected: any;
  message: string | null;
}

export interface Assert {
  fail(message?: string): void;
  pass(message?: string): void;
  ok(value: unknown, message?: string): void;
  notOk(value: unknown, message?: string): void;
  error(err: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  notEqual(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
  deepNotEqual(actual: unknown, expected: unknown, message?: string): void;
  throws(fn: () => void, expected: unknown, message?: string): void;
  doesNotThrow(fn: () => void, message?: string): void;
  rejects(
    fn: () => Promise<void>,
    expected: unknown,
    message?: string,
  ): Promise<void>;
  resolves(fn: () => Promise<void>, message?: string): Promise<void>;
  match(value: unknown, regexp: RegExp, message?: string): void;
  doesNotMatch(value: unknown, regexp: RegExp, message?: string): void;
  test(name: string, test: (t: Assert) => Promise<void>): Promise<void>;
}

export type Suite = (t: Assert) => Promise<void>;

export interface Test {
  path: string[];
  test: Suite;
  run(): Promise<Assertion[]>;
}

let _TestImpl: any = null as any;

export class TestImpl implements Test {
  constructor(
    public path: string[],
    public test: Suite,
  ) {}

  async run(): Promise<Assertion[]> {
    const { path } = this;
    let asserts: Assertion[] = [];

    await this.test({
      fail(message?: string): void {
        asserts.push({
          path,
          type: 'fail',
          actual: null,
          expected: null,
          message: message || null,
        });
      },
      pass(message?: string): void {
        asserts.push({
          path,
          type: 'pass',
          actual: null,
          expected: null,
          message: message || null,
        });
      },
      ok(value: unknown, message?: string) {
        asserts.push({
          path,
          type: 'ok',
          actual: value,
          expected: null,
          message: message || null,
        });
      },
      notOk(value: unknown, message?: string) {
        asserts.push({
          path,
          type: 'notOk',
          actual: value,
          expected: null,
          message: message || null,
        });
      },
      error(err: unknown, message?: string) {
        asserts.push({
          path,
          type: 'error',
          actual: err,
          expected: null,
          message: message || null,
        });
      },
      equal(actual: unknown, expected: unknown, message?: string) {
        asserts.push({
          path,
          type: 'equal',
          actual,
          expected,
          message: message || null,
        });
      },
      notEqual(actual: unknown, expected: unknown, message?: string) {
        asserts.push({
          path,
          type: 'notEqual',
          actual,
          expected,
          message: message || null,
        });
      },
      deepEqual(actual: unknown, expected: unknown, message?: string) {
        asserts.push({
          path,
          type: 'deepEqual',
          actual,
          expected,
          message: message || null,
        });
      },
      deepNotEqual(actual: unknown, expected: unknown, message?: string) {
        asserts.push({
          path,
          type: 'deepNotEqual',
          actual,
          expected,
          message: message || null,
        });
      },
      throws(fn: () => void, expected: unknown, message?: string): void {
        try {
          fn();
        } catch (err) {
          asserts.push({
            path,
            type: 'throws',
            actual: err,
            expected,
            message: message || null,
          });
          return;
        }
        asserts.push({
          path,
          type: 'throws',
          actual: null,
          expected,
          message: message || null,
        });
      },
      doesNotThrow(fn: () => void, message?: string): void {
        try {
          fn();
        } catch (err) {
          asserts.push({
            path,
            type: 'doesNotThrow',
            actual: err,
            expected: null,
            message: message || null,
          });
          return;
        }
        asserts.push({
          path,
          type: 'doesNotThrow',
          actual: null,
          expected: null,
          message: message || null,
        });
      },
      async rejects(
        fn: () => Promise<void>,
        expected: unknown,
        message?: string,
      ): Promise<void> {
        try {
          await fn();
        } catch (err: any) {
          asserts.push({
            path,
            type: 'rejects',
            actual: err,
            expected,
            message: message || null,
          });
          return;
        }
        asserts.push({
          path,
          type: 'rejects',
          actual: null,
          expected,
          message: message || null,
        });
      },
      async resolves(fn: () => Promise<void>, message?: string): Promise<void> {
        try {
          await fn();
        } catch (err) {
          asserts.push({
            path,
            type: 'resolves',
            actual: err,
            expected: null,
            message: message || null,
          });
          return;
        }
        asserts.push({
          path,
          type: 'resolves',
          actual: null,
          expected: null,
          message: message || null,
        });
      },
      match(value: unknown, regexp: RegExp, message?: string): void {
        asserts.push({
          path,
          type: 'match',
          actual: value,
          expected: regexp,
          message: message || null,
        });
      },
      doesNotMatch(value: unknown, regexp: RegExp, message?: string): void {
        asserts.push({
          path,
          type: 'doesNotMatch',
          actual: value,
          expected: regexp,
          message: message || null,
        });
      },
      async test(name: string, test: Suite): Promise<void> {
        const t = new _TestImpl(path.concat([name]), test);
        asserts = asserts.concat(await t.run());
      },
    });

    return asserts;
  }
}

_TestImpl = TestImpl;

export function test(name: string, test: (t: Assert) => Promise<void>): Test {
  return new TestImpl([name], test);
}
