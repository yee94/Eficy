import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      // '@eficy/core-v3': path.resolve(__dirname, '../core-v3/src/index.ts'),
      // 'reflect-metadata': path.resolve(__dirname, './node_modules/reflect-metadata/Reflect.js'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
