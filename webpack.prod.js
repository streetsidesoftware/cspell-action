/* eslint-disable @typescript-eslint/no-var-requires */
const config = require('./webpack.config');

module.exports = {
  ...config,
  mode: 'production',
};
