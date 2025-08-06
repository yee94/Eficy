import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      resolve: {
        alias: {
          react: './mocks/react.ts',
          'react-dom': './mocks/react-dom.ts',
          '@': './src',
        },
      },
      source: {
        define: {
          'process.env.NODE_ENV': '"production"',
        },
        entry: {
          index: './src/index.ts',
        },
      },
      format: 'esm',
      outBase: 'dist',
      autoExternal: false,
    },
  ],
  output: {
    target: 'web',
    minify: true,
    distPath: {
      root: 'dist',
    },
  },
});
