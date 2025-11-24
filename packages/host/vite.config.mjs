import { defineConfig } from '@jfhbrook/grabthar/vite';

export default defineConfig({
  ssr: {
    external: ['@matanuska/output', '@matanuska/path'],
  },
  /*
  build: {
    external: [
      '@matanuska/output',
      '@matanuska/path',
    ],
  },
  optimizeDeps: {
    exclude: [
      '@matanuska/output',
      '@matanuska/path',
    ],
  },
  */
});
