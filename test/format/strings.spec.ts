import { describe, expect, test } from 'vitest';

import { inspectString } from '../../format';

describe('inspectString', () => {
  test('it inspects strings without quotes', () => {
    expect(inspectString('hello')).toBe("'hello'");
  });
  test('it inspects strings with single quotes', () => {
    expect(inspectString("don't")).toBe('"don\'t"');
  });

  test('it inspects strings with double quotes', () => {
    expect(inspectString('"time machine"')).toBe('\'"time machine"\'');
  });

  test('it inspects strings with both kinds of quotes', () => {
    expect(inspectString('don\'t mess with my "time machine"')).toBe(
      "'don\\'t mess with my \"time machine\"'",
    );
  });
});
