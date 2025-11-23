import { describe, test as vitest, expect } from 'vitest';

import { Assertion, Test, TestImpl, Suite } from './index.js';

export async function test(name: string, suite: Suite): Promise<void> {
  const t: Test = new TestImpl([name], suite);

  const asserts = await t.run();

  const collected: Record<string, Assertion[]> = {};

  for (let assert of asserts) {
    const name = assert.path.join(' ');
    if (!collected[name]) {
      collected[name] = [];
    }
    collected[name].push(assert);
  }

  for (let [name, asserts] of Object.entries(collected)) {
    describe(name, async () => {
      for (let assert of asserts) {
        const { type, actual, expected, message } = assert;

        vitest(message || type, () => {
          switch (type) {
            case 'fail':
              expect.assert(false);
              break;
            case 'pass':
              expect.assert(true);
              break;
            case 'ok':
              expect(actual).toBeTruthy();
              break;
            case 'notOk':
              expect(actual).toBeFalsy();
              break;
            case 'error':
              expect(actual).toBeInstanceOf(Error);
              break;
            case 'equal':
              expect(actual).toBe(expected);
              break;
            case 'notEqual':
              expect(actual).not.toBe(expected);
              break;
            case 'deepEqual':
              expect(actual).toEqual(expected);
              break;
            case 'deepNotEqual':
              expect(actual).not.toEqual(expected);
              break;
            case 'throws':
              expect(actual).toThrowError();
              break;
            case 'doesNotThrow':
              expect(actual).not.toThrowError();
              break;
            case 'rejects':
              expect(actual).rejects.toThrowError();
              break;
            case 'resolves':
              expect(actual).rejects.not.toThrowError();
              break;
            case 'match':
              expect(actual).toMatch(expected);
              break;
            case 'doesNotMatch':
              expect(actual).not.toMatch(expected);
              break;
          }
        });
      }
    });
  }
}
