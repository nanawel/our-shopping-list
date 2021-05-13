module.exports = {
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
