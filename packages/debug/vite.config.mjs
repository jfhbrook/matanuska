import replace from '@rollup/plugin-replace';

import { packageLoader } from '@jfhbrook/grabthar';

import { defineConfig } from '@jfhbrook/grabthar/vite';

const pkg = packageLoader(import.meta.url);

const MATBAS_VERSION = pkg('../..').version;

export default defineConfig({
  plugins: [
    replace({
      'process.env.MATBAS_VERSION': `'${MATBAS_VERSION}'`,
    }),
  ],
});
