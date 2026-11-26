import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      resolve: {
        alias: {
          'react/jsx-runtime': './mocks/jsx-runtime.ts',
          'react/jsx-dev-runtime': './mocks/jsx-runtime.ts',
          react: './mocks/react.ts',
          'react-dom': './mocks/react-dom.ts',
          '@': './src',
        },
      },
      tools: {
        swc: {
          jsc: {
            transform: {
              react: {
                runtime: 'automatic',
              },
            },
          },
        },
      },
      source: {
        define: {
          'process.env.NODE_ENV': '"production"',
        },
        entry: {
          index: './index.ts',
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
