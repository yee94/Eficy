import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/jsx-runtime.ts', 'src/jsx-dev-runtime.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  external: ['react', '@eficy/reactive', 'tsyringe', 'reflect-metadata'],
});