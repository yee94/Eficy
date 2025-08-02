import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/jsx-runtime.tsx', 'src/jsx-dev-runtime.tsx'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  external: ['react', '@eficy/reactive', 'tsyringe', 'reflect-metadata'],
});