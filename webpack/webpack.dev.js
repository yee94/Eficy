const merge = require('webpack-merge');
const common = require('./webpack.js');
const webpack = require('webpack');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    hot: true,
    host: '127.0.0.1',
    port: 9999,
    inline: true,
    disableHostCheck: true,
    headers: {
      'access-control-allow-origin': '*',
    },
  },
  plugins: [new webpack.HotModuleReplacementPlugin(), new webpack.NamedModulesPlugin()],
});
