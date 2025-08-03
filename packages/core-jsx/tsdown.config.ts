import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/jsx-runtime.tsx', 'src/jsx-dev-runtime.tsx'],
  format: ['esm'],
  dts: true,
  outDir: 'dist',
  clean: true,
  target: 'es2020',
  external: ['react', '@eficy/reactive', 'tsyringe'],
});
