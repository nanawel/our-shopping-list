const path = require('path');
const config = require('./config');

const SERVER_VERSION = process.env.APP_VERSION   || 'dev';
const SERVER_BUILD_ID = process.env.APP_BUILD_ID || '(unknown)';

const sha1 = require('sha1');

const {httpServer} = require('./app');

const {Server} = require('socket.io');
const io = new Server(httpServer, {
  path: path.normalize(`/${config.BASE_URL}/socket.io/`)  // #58/GITHUB#18
});

console.info(`Serving socket-io on ${io.engine.opts.path}`);

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id} using transport:`, socket.conn.transport.name);

  // https://socket.io/docs/v4/performance-tuning/#discard-the-initial-http-request
  socket.request = null;

  socket.conn.once('upgrade', () => {
    console.log(`Client ${socket.id} upgraded transport:`, socket.conn.transport.name);
  });

  socket.conn.on('close', (reason) => {
    console.log(`Client ${socket.id} closed connection:`, reason);
  });

  socket.on('hello', (data, callback) => {
    console.log(`New connection from client ${socket.id}`, data);

    // Fallback for old calls from v1 where there was no data argument specified
    if (typeof callback !== 'function' && typeof data === 'function') {
      callback = data;
    }

    const serverVersion = {
      version: SERVER_VERSION,
      buildId: SERVER_BUILD_ID
    };
    const serverHash = sha1(JSON.stringify(Object.assign({}, serverVersion, require('./config'))));

    if (typeof callback === 'function') {
      callback({
        serverString: `OSL Server (${SERVER_VERSION}-${SERVER_BUILD_ID})`,
        serverVersion,
        serverHash
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

module.exports = {
  io
}
