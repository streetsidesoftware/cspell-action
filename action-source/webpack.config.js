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
    __filename: false,
    __dirname: false,
  },
  externalsType: 'commonjs-module',
  externalsPresets: {
    node: true,
  },
  externals: [
    /^@actions\/core/,
    /^@actions\/github/,
    /^@cspell\/cspell-bundled-dicts/,
  ],
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, '..', 'action'),
  },
};
