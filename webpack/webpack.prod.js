const merge = require('webpack-merge');
const common = require('./webpack.js');

const TerserPlugin = require('terser-webpack-plugin');

const webpackConfig = merge(common, {
  mode: 'production',
  output: {
    filename: '[name].min.js',
  },

  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          extractComments: 'all',
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
  },
});

webpackConfig.plugins = [];

module.exports = webpackConfig;
