import { test as vitest, expect } from 'vitest';

import { test, Assert } from '../';

vitest('assertions', async () => {
  const err = new Error('');
  const fn = () => {};
  const asyncFn = async () => {};
  const re = /a/;

  const t = test('assertions', async (t: Assert): Promise<void> => {
    t.fail('test fail');
    t.pass('test pass');
    t.ok(true, 'test ok');
    t.notOk(false, 'test notOk');
    t.error(err, 'test error');
    t.equal(1, 1, 'test equal');
    t.notEqual(1, 2, 'test notEqual');
    t.deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 }, 'test deepEqual');
    t.deepNotEqual({ a: 1, b: 2 }, { a: 2, b: 1 }, 'test deepNotEqual');
    t.throws(fn, err, 'test throws');
    t.doesNotThrow(fn, 'test doesNotThrow');
    await t.rejects(asyncFn, err, 'test rejects');
    await t.resolves(asyncFn, 'test resolves');
    t.match('a', re, 'test match');
    t.doesNotMatch('b', re, 'test doesNotMatch');
    await t.test('subtest', async (t: Assert) => {
      t.ok(true, 'subtest ok');
    });
  });

  const asserts = await t.run();

  expect(asserts).toEqual([
    {
      actual: null,
      expected: null,
      message: 'test fail',
      path: ['assertions'],
      type: 'fail',
    },
    {
      actual: null,
      expected: null,
      message: 'test pass',
      path: ['assertions'],
      type: 'pass',
    },
    {
      actual: true,
      expected: null,
      message: 'test ok',
      path: ['assertions'],
      type: 'ok',
    },
    {
      actual: false,
      expected: null,
      message: 'test notOk',
      path: ['assertions'],
      type: 'notOk',
    },
    {
      actual: err,
      expected: null,
      message: 'test error',
      path: ['assertions'],
      type: 'error',
    },
    {
      actual: 1,
      expected: 1,
      message: 'test equal',
      path: ['assertions'],
      type: 'equal',
    },
    {
      actual: 1,
      expected: 2,
      message: 'test notEqual',
      path: ['assertions'],
      type: 'notEqual',
    },
    {
      actual: {
        a: 1,
        b: 2,
      },
      expected: {
        a: 1,
        b: 2,
      },
      message: 'test deepEqual',
      path: ['assertions'],
      type: 'deepEqual',
    },
    {
      actual: {
        a: 1,
        b: 2,
      },
      expected: {
        a: 2,
        b: 1,
      },
      message: 'test deepNotEqual',
      path: ['assertions'],
      type: 'deepNotEqual',
    },
    {
      actual: null,
      expected: err,
      message: 'test throws',
      path: ['assertions'],
      type: 'throws',
    },
    {
      actual: null,
      expected: null,
      message: 'test doesNotThrow',
      path: ['assertions'],
      type: 'doesNotThrow',
    },
    {
      actual: null,
      expected: err,
      message: 'test rejects',
      path: ['assertions'],
      type: 'rejects',
    },
    {
      actual: null,
      expected: null,
      message: 'test resolves',
      path: ['assertions'],
      type: 'resolves',
    },
    {
      actual: 'a',
      expected: /a/,
      message: 'test match',
      path: ['assertions'],
      type: 'match',
    },
    {
      actual: 'b',
      expected: /a/,
      message: 'test doesNotMatch',
      path: ['assertions'],
      type: 'doesNotMatch',
    },
    {
      actual: true,
      expected: null,
      message: 'subtest ok',
      path: ['assertions', 'subtest'],
      type: 'ok',
    },
  ]);
});
