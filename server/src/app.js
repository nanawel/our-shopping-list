const MONGODB_HOST = process.env.MONGODB_HOST || 'mongodb';
const MONGODB_PORT = process.env.MONGODB_PORT || '27017';
const MONGODB_DB = process.env.MONGODB_DB     || 'osl';

const fs = require('fs');
const mongoose = require('mongoose');
const express = require('express');
const compression = require('compression');
const {VUE_APP_SINGLEBOARD_MODE} = require('./config');

const app = express();
const https = require('https');
const io = require('socket.io')(https);

const options = {
  key: fs.readFileSync(__dirname + '/../ssl/key.pem'),
  cert: fs.readFileSync(__dirname + '/../ssl/cert.pem'),
};
const server = https.createServer(options, app);

app.disable('x-powered-by');
app.use(compression());
require('./middleware/app/static')(app);
require('./middleware/app/json')(app);

mongoose.connect(`mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DB}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const router = express.Router();
app.use(router);

if (VUE_APP_SINGLEBOARD_MODE) {
  require('./middleware/router/singleboard')(router);
}

module.exports = {
  app,
  https,
  server,
  io,
  router
};
