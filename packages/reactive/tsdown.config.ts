import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs', 'iife'],
  dts: true,
  target: 'es2020',
  clean: true,
  globalName: 'EficyReactive',
}); 