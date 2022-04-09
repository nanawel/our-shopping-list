const mongoose = require('mongoose');
const bus = require('../bus');

const ItemSchema = require('./schema');

ItemSchema.post('save', function (doc, next) {
  bus.emit('model-update', doc);
  next();
});
ItemSchema.post('remove', function (doc, next) {
  bus.emit('model-delete', doc);
  next();
});

const ItemModel = mongoose.model('Item', ItemSchema);

module.exports = ItemModel;
