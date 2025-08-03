import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@eficy/reactive': path.resolve(__dirname, '../reactive/src'),
      '@eficy/core-jsx': path.resolve(__dirname, './src'),
      '@eficy/reactive-react': path.resolve(__dirname, '../reactive-react/src'),
    },
  },
});
