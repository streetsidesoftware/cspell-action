/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

module.exports = {
  entry: './main.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  node: {
    __filename: true,
    __dirname: true,
  },
  externalsPresets: {
    node: true,
  },
  externals: {
    cspell: 'commonjs2 cspell',
    '@actions/core': 'commonjs2 @actions/core',
    '@actions/github': 'commonjs2 @actions/github',
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, '..', 'action'),
  },
};
