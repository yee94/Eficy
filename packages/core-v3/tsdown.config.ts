import { defineConfig } from 'tsdown';

export default defineConfig([
  // ESM 格式
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    outDir: 'dist',
    clean: true,
    sourcemap: false,
    minify: false,
    target: 'es2018',
    external: ['react', 'react-dom', 'antd', 'mobx', 'mobx-react', 'axios', 'lodash', 'nanoid', '@babel/runtime'],
    platform: 'browser',
  },
  // IIFE 格式 (UMD) - 压缩版本用于生产环境
  {
    entry: {
      'index.global': 'src/index.ts',
    },
    format: ['iife'],
    outDir: 'dist',
    clean: false,
    sourcemap: true,
    minify: true,
    target: 'es2018',
    // IIFE 格式配置（用于生成 UMD 类似的产物）
    globalName: 'EficyCore',
    // 强制打包所有非 React 依赖
    noExternal: (id) => {
      // 不将任何模块标记为 noExternal，除了 React
      return id !== 'react' && id !== 'react-dom';
    },
    platform: 'browser',
  },
]);
