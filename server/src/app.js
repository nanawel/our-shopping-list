const MONGODB_HOST = process.env.MONGODB_HOST || 'mongodb';
const MONGODB_PORT = process.env.MONGODB_PORT || '27017';
const MONGODB_DB = process.env.MONGODB_DB     || 'osl';

const SINGLEBOARD_MODE = !!parseInt(process.env.SINGLEBOARD_MODE);

const mongoose = require("mongoose");
const express = require("express");

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.disable('x-powered-by');
app.use(express.static('client/dist'));
app.use(express.json());

mongoose.connect(`mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DB}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const router = express.Router()
if (false) {
  // TODO: Handle arbitrary route prefix
  //app.use('/something', router)
} else {
  app.use(router)
}

module.exports = {
  app,
  http,
  io,
  router,
  SINGLEBOARD_MODE
};
