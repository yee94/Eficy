import { defineConfig } from 'father';

export default defineConfig({
  esm: {},
  cjs: {},
  umd: {
    name: 'Eficy',
    chainWebpack(config) {
      config.merge({
        externals: {
          react: {
            commonjs: 'react',
            commonjs2: 'react',
            amd: 'React',
            root: 'React',
          },
          'react-dom': {
            commonjs: 'react-dom',
            commonjs2: 'react-dom',
            amd: 'ReactDOM',
            root: 'ReactDOM',
          },
          antd: 'antd',
        },
      });

      return config;
    },
  },
});
