import { describe, test as vitest, expect } from 'vitest';

import { Assertion, Test, TestImpl, Suite } from './index.js';

export function test(name: string, suite: Suite): void {
  const t: Test = new TestImpl([name], suite);

  describe(name, async () => {
    const asserts = await t.run();

    const collected: Record<string, Assertion[]> = {};

    for (let assert of asserts) {
      const name = assert.path.slice(1).join(' ');
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
                expect(false).toBeTruthy();
                break;
              case 'pass':
                expect(true).toBeTruthy();
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
                if (expected) {
                  expect(actual).toEqual(expected);
                } else {
                  expect(actual).toBeTruthy();
                }
                break;
              case 'doesNotThrow':
                expect(actual).toBeFalsy();
                break;
              case 'rejects':
                if (expected) {
                  expect(actual).toEqual(expected);
                } else {
                  expect(actual).toBeTruthy();
                }
                break;
              case 'resolves':
                expect(actual).toBeFalsy();
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
  });
}
