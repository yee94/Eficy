import { defineConfig } from 'tsdown';

export default defineConfig([
  // 主入口 - 支持所有格式
  {
    entry: 'src/index.ts',
    format: ['cjs', 'esm', 'iife'],
    dts: true,
    target: 'es2020',
    clean: true,
    globalName: 'EficyReactive',
    external: ['@preact/signals-core', 'reflect-metadata'],
  },
  // annotation 入口 - 只支持 CJS 和 ESM
  {
    entry: 'src/annotation.ts',
    format: ['cjs', 'esm'],
    dts: true,
    target: 'es2020',
    outDir: 'dist',
    external: ['@preact/signals-core', 'reflect-metadata'],
  }
]); 