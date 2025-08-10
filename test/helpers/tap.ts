import { expect } from 'vitest';

import { expectSnapshotWithStack } from './stack';

//
// This object implements an API compatible with node-tap's Test interface.
// It was used to make it easier to port node-tap tests to vitest.
//
// Use of this object is DEPRECATED - future tests should use expect directly.
//
export const test = {
  plan(n: number): void {
    expect.assertions(n);
  },

  ok(o: any, message?: string): void {
    expect(o, message).toBeTruthy();
  },

  equal(actual: any, expected: any, message?: string): void {
    expect(actual, message).toBe(expected);
  },

  notEqual(actual: any, expected: any, message?: string): void {
    expect(actual, message).not.toBe(expected);
  },

  same(actual: any, expected: any, message?: string): void {
    expect(actual, message).toEqual(expected);
  },

  has(actual: any, has: any, message?: string): void {
    expect(actual, message).toMatchObject(has);
  },

  rejects(fn: () => any, errType: any, message?: string): Promise<void> {
    return expect(fn(), message).rejects.toBeInstanceOf(errType);
  },

  match(actual: any, expected: any, message?: string): void {
    expect(actual, message).toMatch(expected);
  },

  type(o: any, type: any): void {
    expect(o).toBeInstanceOf(type);
  },

  throws(fn: () => any, err?: any): any {
    if (typeof err === 'undefined') {
      expect(fn).toThrow();
      return;
    }
    expect(fn).toThrowError(err);
  },

  matchSnapshot(actual: any, message?: string): void {
    if (typeof actual === 'string') {
      expectSnapshotWithStack(actual, message);
      return;
    }
    expect(actual, message).toMatchSnapshot();
  },
};

export type Test = typeof test;

export const t = test;
