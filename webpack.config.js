/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

module.exports = {
  entry: './src/main_root.ts',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
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
    /^import-fresh/, // Do not bundle `import-fresh` which is used by `cosmiconfig` to load cspell.config.js files.
  ],
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'action'),
  },
};
