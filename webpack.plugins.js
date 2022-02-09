const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  new CopyPlugin({
    patterns: [
      { from: "node_modules/@fluentui/font-icons-mdl2/fonts", to: 'fonts' },
    ],
  }),
];
