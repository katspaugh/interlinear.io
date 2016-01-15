var webpack = require('webpack');

module.exports = {
  entry: {
    'app': './ng2/app.ts',
    'vendor': './ng2/vendor.ts'
  },
  output: {
    path: "./public",
    filename: "bundle.js"
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js')
  ],

  resolve: {
    extensions: ['', '.ts', '.js']
  },

  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts-loader' },
    ],
    noParse: [ /angular2\/bundles\/.+/ ]
  }
};
