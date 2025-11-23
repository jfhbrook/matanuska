import { test as vitest, expect } from 'vitest';

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
    vitest(name, async () => {
      for (let assert of asserts) {
        const { type, actual, expected, message } = assert;

        switch (type) {
          case 'fail':
            break;
          case 'pass':
            break;
          case 'ok':
            break;
          case 'notOk':
            break;
          case 'error':
            break;
          case 'equal':
            break;
          case 'notEqual':
            break;
          case 'deepEqual':
            break;
          case 'deepNotEqual':
            break;
          case 'throws':
            break;
          case 'doesNotThrow':
            break;
          case 'rejects':
            break;
          case 'resolves':
            break;
          case 'match':
            break;
          case 'doesNotMatch':
            break;
        }
      }
    });
  }
}
