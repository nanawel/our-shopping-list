const mongoose = require('mongoose');
const bus = require('../bus');

const ListSchema = require('./schema');

ListSchema.post('save', function (doc, next) {
  bus.emit('model-update', doc);
  next();
});
ListSchema.post('remove', function (doc, next) {
  bus.emit('model-delete', doc);
  next();
});

const ListModel = mongoose.model('List', ListSchema);

module.exports = ListModel;
