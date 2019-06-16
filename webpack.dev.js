const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const common = require('./webpack.js');
const webpack = require('webpack');
const path = require('path');
const glob = require('glob');

function getView(globPath, flag) {
  let files = glob.sync(globPath);

  let entries = {},
    entry,
    dirname,
    basename,
    pathname,
    extname;

  files.forEach(item => {
    entry = item;
    dirname = path.dirname(entry); //当前目录
    extname = path.extname(entry); //后缀
    basename = path.basename(entry, extname); //文件名
    pathname = path.join(dirname, basename); //文件路径
    if (extname === '.html') {
      entries[pathname] = './' + entry;
    } else if (extname === '.js') {
      entries[basename] = entry;
    }
  });

  return entries;
}
const pagesConfig = getView('./public/example/*js');

module.exports = merge.smart(common, {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    contentBase: path.join(__dirname, '/public/example/'),
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
    ...Object.keys(pagesConfig).map(pageChunk => {
      const filename = path.basename(pagesConfig[pageChunk]);
      return new HtmlWebpackPlugin({
        filename: `${pageChunk}.html`,
        template: `public/index.html`,
        chunks: ['index'],
        files: {
          js: [filename],
        },
      });
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
  ],
});
