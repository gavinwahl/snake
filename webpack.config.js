var webpack = require('webpack');

module.exports = {
  devtool: '#inline-source-map',
  entry: [
    './app.jsx'
  ],
  output: {
    path: __dirname + '/build',
    filename: 'bundle.js',
    publicPath: 'http://localhost:8001/build'
  },
  module: {
    loaders: [
      {test: /\.scss$/, loaders: ['style-loader', 'css-loader', 'sass-loader']},
      {test: /\.jsx$/, loaders: ['jsx-loader?harmony']}
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  resolveLoader: {
    modulesDirectories: ['node_modules']
  },
}
