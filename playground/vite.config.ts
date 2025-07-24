import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    import('vite-plugin-pages')
      .then((m) => m.default)
      .then((m) => m({ dirs: ['src/examples'] })),
  ],
});
