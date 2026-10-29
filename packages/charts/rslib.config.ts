import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [{
    resolve: {
      alias: {
        react: '../shadcn-ui/mocks/react.ts',
        'react-dom': '../shadcn-ui/mocks/react-dom.ts',
      },
    },
    source: {
      define: { 'process.env.NODE_ENV': '"production"' },
      entry: { index: './index.ts' },
    },
    format: 'esm',
    outBase: 'dist',
    autoExternal: false,
  }],
  output: {
    target: 'web',
    minify: true,
    distPath: { root: 'dist' },
  },
});
