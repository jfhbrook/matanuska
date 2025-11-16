import { join, resolve } from 'node:path';
import { readFileSync } from 'node:fs';

import { expect, test } from 'vitest';

import main from '../src/index';

test('integration', async () => {
  await main([resolve(join(__dirname, '../example/ast.citree'))]);

  for (let f of ['instr.ts', 'expr.ts', 'index.ts']) {
    const out = readFileSync(resolve(join(__dirname, '../example', f)), 'utf8');
    expect(out).toMatchSnapshot();
  }
});
