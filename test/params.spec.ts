import { describe, expect, test } from 'vitest';

import { nil } from '../value';
import cd from '../commands/cd';
import load from '../commands/load';
import pwd from '../commands/pwd';

describe('cd', () => {
  test('cd ./', () => {
    const params = cd.params.parse(['./']);

    expect(params.path).toBe('./');
  });

  test('cd (no path)', () => {
    const params = cd.params.parse([]);

    expect(params.path).toBe(nil);
  });
});

describe('load', () => {
  test('load ./script.bas', () => {
    const params = load.params.parse(['./script.bas']);

    expect(params.filename).toBe('./script.bas');
    expect(params.run).toBe(nil);
  });

  test('load ./script.bas --run', () => {
    const params = load.params.parse(['./script.bas', '--run']);

    expect(params.filename).toBe('./script.bas');
    expect(params.run).toBe(true);
  });
});

describe('pwd', () => {
  test('pwd', () => {
    const params = pwd.params.parse([]);

    expect(params.P).toBe(nil);
    expect(params.L).toBe(nil);
  });

  test('pwd -P', () => {
    const params = pwd.params.parse(['-P']);

    expect(params.P).toBe(true);
    expect(params.L).toBe(nil);
  });

  test('pwd -L', () => {
    const params = pwd.params.parse(['-L']);

    expect(params.P).toBe(nil);
    expect(params.L).toBe(true);
  });
});
