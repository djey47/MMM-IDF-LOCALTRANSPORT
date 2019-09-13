/** Configuration for client-side webpack bundle **/

const { outputPath, moduleRules, commonPlugins } = require('./webpack.config.common.js');

module.exports = {
  entry: './src/client/module.js',
  output: {
    filename: 'MMM-IDF-LOCALTRANSPORT.js',
    path: outputPath,
  },
  module: {
    rules: moduleRules,
  },
  plugins: commonPlugins,
};