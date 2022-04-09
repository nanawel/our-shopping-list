const SERVER_VERSION = process.env.APP_VERSION   || 'dev';
const SERVER_BUILD_ID = process.env.APP_BUILD_ID || '(unknown)';

const {createProxyMiddleware} = require('http-proxy-middleware');
const sha1 = require('sha1');

const {app, io} = require('./app');

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.conn.once('upgrade', () => {
    console.log(`Client ${socket.id} upgraded transport:`, socket.conn.transport.name);
  });

  socket.conn.on('close', (reason) => {
    console.log(`Client ${socket.id} closed connection |`, reason);
  });

  socket.on('hello', (data, callback) => {
    console.log(`New connection from client ${socket.id}`, data)
    callback({
      serverString: `OSL Server (${SERVER_VERSION}-${SERVER_BUILD_ID})`,
      serverVersion: {
        version: SERVER_VERSION,
        buildId: SERVER_BUILD_ID,
        configHash: sha1(JSON.stringify(require('./config')))
      }
    });
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Proxify Node WS to Webpack server in developer mode
if (process.env.NODE_ENV === 'development') {
  app.use('/sockjs-node', createProxyMiddleware(
    '/sockjs-node', {
      target: 'ws://localhost:8081',
      ws: true,
    }
  ));
  console.log('Created proxy middleware for /sockjs-node (development mode)');
}
