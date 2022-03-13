const SERVER_VERSION = process.env.APP_VERSION   || 'dev';
const SERVER_BUILD_ID = process.env.APP_BUILD_ID || '(unknown)';

const {createProxyMiddleware} = require("http-proxy-middleware");

const {app, io} = require('./app');

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('hello', (callback) => {
    callback({
      serverString: `OSL Server (${SERVER_VERSION}-${SERVER_BUILD_ID})`,
      version: SERVER_VERSION,
      buildId: SERVER_BUILD_ID
    });
  });
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});
// Proxify Node WS to Webpack server in developer mode
app.use('/sockjs-node', createProxyMiddleware(
  '/sockjs-node', {
    target: 'ws://localhost:8081',
    ws: true,
  }
));
const notifyModelUpdate = function(modelType, model) {
  console.log('notifyModelUpdate', modelType, model);
  io.sockets.emit('model-update', {
    type: modelType,
    model
  })
}
const notifyModelDelete = function(modelType, model) {
  console.log('notifyModelDelete', modelType, model);
  io.sockets.emit('model-delete', {
    type: modelType,
    model
  })
}

module.exports = {
  notifyModelUpdate,
  notifyModelDelete
}
