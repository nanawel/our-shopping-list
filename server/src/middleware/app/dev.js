// Proxify Node WS to Webpack server in developer mode

module.exports = function (app) {
  const {createProxyMiddleware} = require('http-proxy-middleware');

  if (process.env.NODE_ENV === 'development') {
    app.use(createProxyMiddleware('/webpack-ws', {
        target: 'http://localhost:8081',
        changeOrigin: true,
        ws: true
      }
    ));
    console.log('Created proxy middleware for /webpack-ws (development mode)');
  }
};
