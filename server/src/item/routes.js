const {router} = require('../app');
const {notifyModelUpdate, notifyModelDelete} = require('../ws');

const ListModel = require('../list/model');
const ItemModel = require('./model');

router.get('/items', (req, res) => {
  if (process.env.APP_ENV === 'production') {
    res.status(403)
      .json({
        error: {
          message: "Not available in production mode!"
        }
      });
  } else {
    ItemModel.find({}, function (err, docs) {
      if (err) throw err;
      console.log(docs)
      res.status(200)
        .json(docs);
    });
  }
});

router.get('/lists/:listId/items', (req, res) => {
  const listId = req.params.listId;

  ListModel.findOne({
    _id: listId
  }, function (err, doc) {
    if (err) throw err;
    if (doc) {
      ItemModel.find({
        listId: listId
      }, function (err, docs) {
        if (err) throw err;
        res.status(200)
          .json(docs);
      });
    } else {
      res.status(404)
        .json({
          error: {
            message: "List not found"
          }
        });
    }
  });
});

router.post('/items', (req, res) => {
  delete req.body._id;
  const doc = new ItemModel(req.body);
  console.debug('POST ITEM', doc);

  if (!doc.listId) {
    res.status(400)
      .json({
        error: {
          message: "Missing parent list for item"
        }
      });
  } else {
    doc.save(function (err) {
      if (err) throw err;
      res.status(201)
        .json(doc);
      notifyModelUpdate('Item', doc);
    });

    try {
      ListModel.findById(doc.listId, function (err, list) {
        list.markModified('items');
        list.save();
      });
    }
    catch (e) {
      res.status(500)
        .json({
          error: {
            message: e.message
          }
        })
    }
  }
});

router.post('/lists/:listId/items', (req, res) => {
  const listId = req.params.listId;

  ListModel.findById(listId, function (err, list) {
    if (err) throw err;
    if (list) {
      let itemData = req.body;
      const item = new ItemModel(itemData);
      item.listId = list._id;
      console.debug('POST ITEM IN LIST', list, item);
      item.save(function (err) {
        if (err) throw err;
        res.status(201)
          .json(item);
        notifyModelUpdate('Item', item);
      });

      try {
        // Force update list
        list.markModified('items');
        list.save();
      }
      catch (e) {
        res.status(500)
          .json({
            error: {
              message: e.message
            }
          })
      }
    } else {
      res.status(404)
        .json({
          error: {
            message: "List not found"
          }
        });
    }
  });
});

router.patch('/items/:id', (req, res) => {
  const id = req.params.id;
  console.debug('PATCH ITEM', id, req.body);

  ItemModel.findById(id, function (err, item) {
    if (err) throw err;
    if (item) {
      updateItem(item, req.body)
      item.save(function (err) {
        if (err) throw err;
        res.status(200)
          .json(item);
        notifyModelUpdate('Item', item);
      });

      try {
        ListModel.findById(item.listId, function (err, list) {
          list.markModified('items');
          list.save();
        });
      }
      catch (e) {
        res.status(500)
          .json({
            error: {
              message: e.message
            }
          })
      }
    } else {
      res.status(404)
        .json({
          error: {
            message: "Item not found"
          }
        });
    }
  });
});

const updateItem = function(item, newData) {
  const origChecked = item.checked
  const newChecked = newData.checked
  for (f in newData) {
    item[f] = newData[f];
  }
  if (newChecked && !origChecked) {
    item.lastCheckedAt = new Date().toISOString()
  }
}

router.delete('/items/:id', (req, res) => {
  const id = req.params.id;
  console.debug('DELETE ITEM', id, req.body);
  ItemModel.findById(id, function (err, item) {
    if (err) throw err;
    if (item) {
      item.delete(function (err) {
        if (err) throw err;
        res.status(200)
          .json(item);
        notifyModelDelete('Item', item);
      });

      try {
        ListModel.findById(item.listId, function (err, list) {
          list.markModified('items');
          list.save();
        });
      }
      catch (e) {
        res.status(500)
          .json({
            error: {
              message: e.message
            }
          })
      }
    } else {
      res.status(404)
        .json({
          error: {
            message: "Item not found"
          }
        });
    }
  });
});
