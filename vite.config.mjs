import process from 'node:process';

import consts from 'rollup-plugin-consts';
import jscc from 'rollup-plugin-jscc';

import { parseBoolEnv, packageLoader } from '@jfhbrook/grabthar';
import { defineConfig } from '@jfhbrook/grabthar/vite';

const pkg = packageLoader(import.meta.url);

const MATBAS_BUILD =
  process.env.MATBAS_BUILD === 'release' ? 'release' : 'debug';

export default defineConfig({
  plugins: [
    consts({
      matbas: {
        build: MATBAS_BUILD,
        version: pkg('.').version,
      },
      versions: {
        matbas: pkg('.').version,
        vite: pkg('vite').version,
        swc: pkg('@swc/core').version,
      },
    }),
    jscc({
      values: {
        _MATBAS_BUILD: MATBAS_BUILD,
        _DEBUG_TRACE: parseBoolEnv(process.env.DEBUG_TRACE),
        _DEBUG_SHOW_TREE: parseBoolEnv(process.env.DEBUG_SHOW_TREE),
        _DEBUG_TRACE_COMPILER: parseBoolEnv(process.env.DEBUG_TRACE_COMPILER),
        _DEBUG_SHOW_CHUNK: parseBoolEnv(process.env.DEBUG_SHOW_CHUNK),
        _DEBUG_TRACE_RUNTIME: parseBoolEnv(process.env.DEBUG_TRACE_RUNTIME),
        _DEBUG_TRACE_GC: parseBoolEnv(process.env.DEBUG_TRACE_GC),
      },
    }),
  ],
});
