const fs = require('fs');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  publicPath: './',
  productionSourceMap: process.env.NODE_ENV !== 'production',
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
    port: 8081,
    allowedHosts: 'all',
    webSocketServer: 'ws',
    hot: true,
    server: {
      type: 'https',
      options: {
        key: '../ssl/key.pem',
        cert: '../ssl/cert.pem',
      }
    },
    client: {
      webSocketURL: {
        hostname: '0.0.0.0',
      },
    },
    devMiddleware: {
      publicPath: '/dist/',
      writeToDisk: true
    }
  },
  pwa: {
    name: 'Our Shopping List',
    themeColor: '#80cbc4',
    msTileColor: '#ffffff',
    manifestOptions: {
      short_name: 'OSL'
    },
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
      exclude: ['index.html'],
      runtimeCaching: [
        {
          urlPattern: new RegExp('config\\.js$'),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'osl-runtime-config'
          }
        },
        {
          urlPattern: new RegExp('\\.(?:css|ico|js|png|svg|woff|woff2)$'),
          handler: 'CacheFirst',
          options: {
            cacheName: 'osl-assets'
          }
        }
      ]
    },
    iconPaths: {
      faviconSVG: null,
      favicon32: 'img/icons/favicon-32x32.png',
      favicon16: 'img/icons/favicon-16x16.png',
      appleTouchIcon: 'img/icons/apple-touch-icon.png',
      maskIcon: null,
      msTileImage: 'img/icons/mstile-144x144.png'
    }
  }
}
