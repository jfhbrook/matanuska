import { resolve } from 'node:path';

import { expect, test } from 'vitest';

import { Spec } from '../src/ast';
import { Imports, resolveImports } from '../src/imports';

const SPEC: Spec = {
  imports: [
    {
      type: 'import',
      statement: 'import { Token } from "./token";',
      path: './token',
    },
  ],
  types: [
    {
      type: 'type',
      name: 'Expr',
      path: './expr',
      imports: [
        {
          type: 'import',
          statement: 'import * from "./value";',
          path: './value',
        },
      ],
      nodes: [
        {
          type: 'node',
          name: 'Call',
          fields: [{ name: 'args', type: 'Expr[]', default: null }],
        },
      ],
    },
  ],
};

const EXPECTED: Imports = {};
EXPECTED[resolve('./expr.ts')] = [
  'import { Token } from "./token";',
  'import * from "./value";',
];

test('resolves imports types', () => {
  expect(resolveImports('./imports.ts', SPEC)).toEqual(EXPECTED);
});
