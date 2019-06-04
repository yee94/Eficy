const path = require('path');
const rootPath = path.resolve(__dirname, './');

module.exports = {
  context: rootPath,
  entry: {
    index: './src/index.ts',
  },
  mode: 'production',
  output: {
    library: 'Eficy',
    libraryExport: 'default',
    libraryTarget: 'umd',
    filename: '[name].js',
    path: path.resolve(rootPath, 'build'),
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
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    '@alife/next': 'Next',
  },
};
