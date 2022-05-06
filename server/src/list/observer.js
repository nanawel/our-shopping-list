const bus = require('../bus');

const ListModel = require('./model');
const ItemModel = require('../item/model');

bus.on('model-update', function (doc) {
  if (doc instanceof ItemModel) {
    ListModel
      .findById(doc.listId)
      .then((list) => {
        list.markModified('items');
        list.save();
      });
  }
});

bus.on('model-delete', function (doc) {
  if (doc instanceof ItemModel) {
    ListModel
      .findById(doc.listId)
      .then((list) => {
        list.markModified('items');
        list.save();
      });
  }
});
