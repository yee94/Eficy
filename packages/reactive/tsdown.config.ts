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
]); 