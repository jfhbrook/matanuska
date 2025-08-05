import { describe, expect, test } from 'vitest';
import { t } from './tap';

import { BaseException } from '../../exceptions';
import { formatter } from '../../format';

import { expectSnapshotWithStack } from './stack';
import { TRACEBACK } from './traceback';

export async function throws(fn: () => any) {
  let error: any = null;
  try {
    await fn();
  } catch (err) {
    error = err;
  }
  expect(error).toBeTruthy();
  expectSnapshotWithStack(formatter.format(error));
}

export function simpleTest(ctor: typeof BaseException): void {
  test(`Can construct a ${ctor.name} with a traceback`, () => {
    const exc = new ctor('Some exception', TRACEBACK);

    t.ok(exc);
    t.equal(exc.message, 'Some exception');
    t.same(exc.traceback, TRACEBACK);
  });

  test(`Can construct a ${ctor.name} without a traceback`, () => {
    const exc = new ctor('Some exception', null);

    t.ok(exc);
    t.equal(exc.message, 'Some exception');
    t.same(exc.traceback, null);
  });
}

export function simpleSuite(
  name: string,
  exceptions: Array<typeof BaseException>,
): void {
  describe(name, () => {
    for (const ctor of exceptions) {
      simpleTest(ctor);
    }
  });
}
