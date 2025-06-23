const MONGODB_HOST = process.env.MONGODB_HOST || 'mongodb';
const MONGODB_PORT = process.env.MONGODB_PORT || '27017';
const MONGODB_DB = process.env.MONGODB_DB     || 'osl';
const ENABLE_TLS = process.env.ENABLE_TLS     || 0;

const fs = require('fs');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const express = require('express');
const compression = require('compression');
const {VITE_SINGLEBOARD_MODE} = require('./config');

const app = express();

const http = ENABLE_TLS ? require('https') : require('http');

let options = {};
if (ENABLE_TLS) {
  options = {
    key: fs.readFileSync(__dirname + '/../ssl/key.pem'),
    cert: fs.readFileSync(__dirname + '/../ssl/cert.pem'),
  };
}

const httpServer = http.createServer(options, app);

app.disable('x-powered-by');
app.use(compression());

// #58/GITHUB#18 Add support for custom web root
// Must be the first app middleware registered
require('./middleware/app/webroot')(app);

require('./middleware/app/pwa')(app);
require('./middleware/app/static')(app);
require('./middleware/app/json')(app);


mongoose.connect(`mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DB}`);

const router = express.Router();
app.use(router);

if (VITE_SINGLEBOARD_MODE) {
  require('./middleware/router/singleboard')(router);
}

module.exports = {
  app,
  httpServer,
  router
};
