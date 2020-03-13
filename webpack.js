const path = require('path');
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const rootPath = path.resolve(__dirname, './');
const flatten = require('lodash/flatten');

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
const layoutConfig = getView('./public/layout/*js');

module.exports = {
  context: rootPath,
  entry: {
    index: './src/index.ts',
  },
  output: {
    library: 'Eficy',
    // libraryExport: '',
    libraryTarget: 'umd',
    filename: '[name].js',
    path: path.resolve(rootPath, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [
    ...Object.keys(pagesConfig).map(pageChunk => {
      const filename = path.basename(pagesConfig[pageChunk]);
      return new HtmlWebpackPlugin({
        filename: `example/${pageChunk}.html`,
        template: `public/index.html`,
        chunks: ['index'],
        inject: false,
        files: {
          js: [filename],
        },
      });
    }),
    ...flatten(
      Object.keys(layoutConfig).map(pageChunk => {
        const layoutFile = path.basename(layoutConfig[pageChunk]);
        return Object.keys(pagesConfig).map(contentChunk => {
          const filename = path.basename(pagesConfig[contentChunk]);
          return new HtmlWebpackPlugin({
            filename: `${pageChunk}/${contentChunk}.html`,
            template: `public/layout.html`,
            chunks: ['index'],
            inject: false,
            files: {
              js: [filename],
            },
            layout: {
              js: [layoutFile],
            },
          });
        });
      }),
    ),
    new CopyPlugin([{ from: 'public/example', to: 'example' }]),
    new CopyPlugin([{ from: 'public/layout', to: 'layout' }]),
  ],
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    '@alife/next': 'Next',
    antd: 'antd',
  },
};
