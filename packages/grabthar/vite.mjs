import { defineConfig as defineViteConfig } from 'vite';

import swc from 'unplugin-swc';
import { minify } from 'rollup-plugin-esbuild-minify';

import config from './config.mjs';
import { swcConfig } from './swc.mjs';

export const testConfig = {
  exclude: config.test.exclude,
  coverage: {
    ...config.coverage,
    exclude: config.coverage.exclude,
  },
};

export function defineConfig(cfg) {
  const c = Object.assign({}, cfg, {
    build: {
      ...config.build,
      ssr: config.entrypoint,
      outDir: config.outDir,
      rollupOptions:
        config.moduleType === 'commonjs'
          ? {
              output: {
                format: 'cjs',
              },
            }
          : {},
    },
    ssr: { ...(cfg.ssr || {}) },
    test: {
      ...(cfg.test || {}),
      ...testConfig,
    },
    plugins: [
      ...(cfg.plugins || []),
      swc.vite(swcConfig),
      config.build.minify && minify(),
    ],
  });

  console.log('Running Vite with the following configuration:');
  console.log('---');
  console.log(c);
  console.log('---');

  return defineViteConfig(c);
}
