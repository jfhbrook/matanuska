import { describe, expect, test } from 'vitest';

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

    expect(params.path).toBe(null);
  });
});

describe('load', () => {
  test('load ./script.bas', () => {
    const params = load.params.parse(['./script.bas']);

    expect(params.filename).toBe('./script.bas');
    expect(params.run).toBe(null);
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

    expect(params.P).toBe(null);
    expect(params.L).toBe(null);
  });

  test('pwd -P', () => {
    const params = pwd.params.parse(['-P']);

    expect(params.P).toBe(true);
    expect(params.L).toBe(null);
  });

  test('pwd -L', () => {
    const params = pwd.params.parse(['-L']);

    expect(params.P).toBe(null);
    expect(params.L).toBe(true);
  });
});
