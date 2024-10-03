// This test is automatically generated by @matanuska/test-generator.
// See ./tools/test-generator/README.md for more details.

import { describe, test, expect } from 'vitest';

import { FILENAME } from './helpers/files';
import { parseProgram } from './helpers/parser';

describe('operator precedence', () => {
  test('9 > 8 == -7 and 6 + 5 or 4 * 3 - 2 / 1', () => {
    const [ast, warning] = parseProgram(
      `10 9 > 8 == -7 and 6 + 5 or 4 * 3 - 2 / 1`,
      FILENAME,
    );

    expect((ast.lines[0].instructions[0] as any).expression).toMatchSnapshot();
    expect(warning).toMatchSnapshot();
  });
});
