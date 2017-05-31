var path = require('path');
var appRootPath = require('app-root-dir').get();

module.exports = {
  entry: './src/client/module.js',
  output: {
    filename: 'MMM-IDF-STIF-NAVITIA.js',
    path: path.resolve(appRootPath),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env', 'es2015'],
          },
        },
      },
    ],
  },
};