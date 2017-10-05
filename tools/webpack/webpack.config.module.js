/** Configuration for client-side webpack bundle **/

const { outputPath, commonRules, commonPlugins } = require('./webpack.config.common.js');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: './src/client/module.js',
  output: {
    filename: 'MMM-IDF-LOCALTRANSPORT.js',
    path: outputPath,
  },
  module: {
    rules: commonRules.concat([{
      test: /\.(css|scss)$/,
      exclude: /(node_modules)/,
      loader: ExtractTextPlugin.extract({
        use: 'css-loader!sass-loader',
        fallback: 'style-loader',
      }),
    }]),
  },
  plugins: commonPlugins.concat([
    new ExtractTextPlugin('styles.css'),    
  ]),
};
