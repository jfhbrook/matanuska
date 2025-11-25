import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  {
    ignores: [],
  }, {
    rules: {
      'interface-name-prefix': 'off',
      'explicit-function-return-type': 'off',
      'explicit-module-boundary-types': 'off',
      'no-explicit-any': 'off',
      'no-unused-vars': [
        "error",
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        }
      ],
      'no-unused-expressions': ['error', {}]
    }
  }
];
