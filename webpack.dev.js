const { merge } = require('webpack-merge');
const common = require('./webpack.js');
const webpack = require('webpack');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    hot: true,
    host: '0.0.0.0',
    port: 9999,
    headers: {
      'access-control-allow-origin': '*',
    },
  },
  optimization: {
    moduleIds: 'named',
  },

  plugins: [new webpack.HotModuleReplacementPlugin()],
});
