const path = require("path").normalize;

module.exports = {
  entry: "./components/app.js",
  mode: "production",
  devtool: "source-map",
  output: {
    path: path(__dirname + "/public/dist"),
    filename: "bundle.js",
    sourceMapFilename: "bundle.js.map"
  },
  module: {
    noParse: /(mapbox-gl)\.js$/,
    rules: [
      {
        test: /\.(js|svg)$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["env", "es2015", "react"],
            plugins: ["transform-object-rest-spread"]
          }
        }
      },
      {
        test: /\.svg$/,
        loaders: ["svg-sprite-loader"]
      },
      {
        test: /\.css$/,
        loader:
          "style-loader!css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]"
      }
    ]
  }
};
