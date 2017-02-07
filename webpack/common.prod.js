const webpack = require('webpack');

module.exports = {
  plugins: [
    new webpack.DefinePlugin({ '$$webpack_dev': JSON.stringify(false)}),
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      compress: {
        warnings: true,
        drop_console: false,
      }
    }),
  ],
};


