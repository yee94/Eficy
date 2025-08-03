import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      resolve: {
        alias: {
          react: './mocks/react.ts',
          'react-dom': './mocks/react-dom.ts',
        },
      },
      source: {
        define: {
          'process.env.NODE_ENV': '"production"',
        },
        entry: {
          standalone: './src/standalone.tsx',
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
