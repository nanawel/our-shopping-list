//const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  pages: {
    index: {
      entry: 'src/main.js',
      title: 'Our Shopping List',
    },
  },
  // configureWebpack: {
  //   plugins: [
  //     new BundleAnalyzerPlugin({ /* https://www.npmjs.com/package/webpack-bundle-analyzer */
  //       analyzerMode: 'static',
  //       analyzerHost: '0.0.0.0'
  //     }),
  //   ]
  // },
  devServer: {
      disableHostCheck: true,
      port: 8080,
      public: '0.0.0.0:8080',
      publicPath: '/dist/',
      writeToDisk: true,
  },
  pwa: {
    name: 'Our Shopping List',
    themeColor: '#80cbc4',
    msTileColor: '#ffffff',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {}
  }
}
