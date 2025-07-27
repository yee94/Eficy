import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@eficy/core': path.resolve(__dirname, '../packages/core/src/index.ts'),
    },
  },
  plugins: [
    react(),
    import('vite-plugin-pages')
      .then((m) => m.default)
      .then((m) => m({ dirs: ['src/examples'] })),
  ],
});
