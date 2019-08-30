/** Common configuration for webpack bundles **/

const path = require('path');
const appRootPath = require('app-root-dir').get();
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  outputPath: path.resolve(appRootPath),
  moduleRules: [
    {
      test: /\.js$/,
      exclude: /(node_modules)/,
      use: {
        loader: 'babel-loader',
      },
    },
  ],
  commonPlugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'disabled',
      generateStatsFile: true,
    }),
  ],
};
