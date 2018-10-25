const nodeExternals = require('webpack-node-externals');
const path = require('path');
const slsw = require('serverless-webpack');

module.exports = {
  mode: process.env.STAGE === 'prod' ? 'production' : 'development',
  entry: slsw.lib.entries,
  target: 'node',
  devtool: 'source-map',
  externals: [nodeExternals({
    modulesFromFile: true,
  })],
  module: {
    rules: [
      {
        test: /\.js$/,
        include: __dirname,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/env'],
            plugins: ['@babel/plugin-transform-runtime'],
          },
        },
      },
    ],
  },
  plugins: [],
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
};
