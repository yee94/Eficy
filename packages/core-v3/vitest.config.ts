import { defineConfig } from 'vitest/config';
import { esbuildDecorators } from 'esbuild-decorators';

export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [esbuildDecorators()],
    },
  },
});
