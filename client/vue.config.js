// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

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
  transpileDependencies: [
    'vuetify'
  ],
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
    workboxOptions: {},
    iconPaths: {
      faviconSVG: null,
      favicon32: 'img/icons/favicon-32x32.png',
      favicon16: 'img/icons/favicon-16x16.png',
      appleTouchIcon: 'img/icons/apple-touch-icon.png',
      maskIcon: 'img/icons/safari-pinned-tab.svg',
      msTileImage: 'img/icons/mstile-144x144.png'
    }
  }
}
