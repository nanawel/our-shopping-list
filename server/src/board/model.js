const mongoose = require('mongoose');
const bus = require('../bus');

const BoardSchema = require('./schema');

BoardSchema.post('save', function (doc, next) {
  bus.emit('model-update', doc);
  next();
});
BoardSchema.post('remove', function (doc, next) {
  bus.emit('model-delete', doc);
  next();
});

const BoardModel = mongoose.model('Board', BoardSchema);

module.exports = BoardModel;
