import { readFileSync } from 'node:fs';

import yaml from 'yaml';

import { merge } from './util.mjs';

let contents = '{}';

try {
  contents = readFileSync('./grabthar.yml', 'utf8');
} catch (_err) {
  try {
    contents = readFileSync('./grabthar.yaml', 'utf8');
  } catch (_err) {
    console.log('No configuration found.');
  }
}

const data = yaml.parse(contents);
const checkData = data.check || {};
const buildData = data.build || {};
const testData = data.test || {};
const coverageData = data.coverage || {};
const formatData = data.format || {};
const lintData = data.lint || {};

const sourceMaps =
  typeof buildData.sourceMaps === 'undefined' ? true : buildData.sourceMaps;

const outDir = data.outDir || 'dist';
const testDir = data.testDir || 'test';

const exclude = merge(data.exclude || [], [outDir]);
const testExclude = merge(exclude, testData.exclude || [], ['node_modules']);

export default {
  ...data,
  outDir,
  exclude,
  target: data.target || 'es2022',
  moduleType: data.moduleType || 'nodenext',
  sourceMaps,
  check: {
    exclude: merge(exclude, checkData.exclude || [], [outDir, 'node_modules']),
    compilerOptions: checkData.compilerOptions || {},
    shellcheck: checkData.shellcheck || {},
  },
  build: {
    sourcemap: sourceMaps,
    exclude: merge(exclude, buildData.exclude || [], [testDir]),
    minify: typeof buildData.minify === 'undefined' ? true : buildData.minify,
  },
  test: {
    exclude: testExclude,
  },
  coverage: {
    enabled:
      typeof coverageData.enabled === 'undefined' ? true : buildData.enabled,
    exclude: merge(exclude, coverageData.exclude || [], [
      outDir,
      testDir,
      '*.config.*',
      'node_modules',
    ]),
  },
  format: {
    ...formatData,
    exclude: merge(formatData.exclude || [], [
      'test/__snapshots__',
      '.prettierrc',
      'tsconfig*.json',
    ]),
  },
  lint: {
    exclude: merge(lintData.exclude || [], [outDir]),
    rules: lintData.rules || {},
  },
};
