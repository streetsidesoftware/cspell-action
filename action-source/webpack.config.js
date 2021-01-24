/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

module.exports = {
  entry: './lib/main_root.ts',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        // Note: this was added because yaml library was failing during the build step
        // see: https://github.com/eemeli/yaml/issues/208#issuecomment-720504241
        test: /node_modules\/yaml\/browser\/dist\/.*/,
        type: 'javascript/auto',
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
            ],
          },
        },
      }
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
    /^@cspell\/cspell-bundled-dicts/,
  ],
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, '..', 'action'),
  },
};
