const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const common = require('./webpack.js');
const webpack = require('webpack');

module.exports = merge.smart(common, {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    contentBase: './build',
    hot: true,
    host: '127.0.0.1',
    port: 9999,
    inline: true,
    disableHostCheck: true,
    headers: {
      'access-control-allow-origin': '*',
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html',
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
  ],
});
