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
  externalsPresets: {
    node: true,
  },
  externals: {
      // cspell: 'commonjs2 cspell',
      // 'cspell-lib': 'commonjs2 cspell-lib',
      '@actions/core': 'commonjs2 @actions/core',
      '@actions/github': 'commonjs2 @actions/github',
      '@cspell/cspell-bundled-dicts': 'commonjs2 @cspell/cspell-bundled-dicts',
      '@cspell/cspell-bundled-dicts/cspell-default.json': 'commonjs2 @cspell/cspell-bundled-dicts/cspell-default.json',
    },
  devtool: 'source-map',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, '..', 'action'),
  },
};
