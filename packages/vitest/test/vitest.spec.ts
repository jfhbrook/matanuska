import type { Assert } from '../';
import { test } from '../vitest';

test('assertions', async (t: Assert) => {
  const err = new Error('');

  t.pass('test pass');
  t.ok(true, 'test ok');
  t.notOk(false, 'test notOk');
  t.error(err, 'test error');
  t.equal(1, 1, 'test equal');
  t.notEqual(1, 2, 'test notEqual');
  t.deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 }, 'test deepEqual');
  t.deepNotEqual({ a: 1, b: 2 }, { a: 2, b: 1 }, 'test deepNotEqual');
  t.throws(
    () => {
      throw err;
    },
    err,
    'test throws',
  );
  t.doesNotThrow(() => {}, 'test doesNotThrow');
  await t.rejects(
    async () => {
      throw err;
    },
    err,
    'test rejects',
  );
  await t.resolves(async () => {}, 'test resolves');
  t.match('a', /a/, 'test match');
  t.doesNotMatch('b', /a/, 'test doesNotMatch');
  await t.test('subtest', async (t: Assert) => {
    t.ok(true, 'subtest ok');
  });
});
