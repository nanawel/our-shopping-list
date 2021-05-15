const express = require('express');
const mongoose = require('mongoose');
const uuid = require('uuid');
const {createProxyMiddleware} = require('http-proxy-middleware');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const SERVER_VERSION = process.env.APP_VERSION   || 'dev';
const SERVER_BUILD_ID = process.env.APP_BUILD_ID || '(unknown)';
const LISTEN_PORT  = process.env.LISTEN_PORT     || 8080;
const MONGODB_HOST = process.env.MONGODB_HOST    || 'mongodb';
const MONGODB_PORT = process.env.MONGODB_PORT    || '27017';
const MONGODB_DB = process.env.MONGODB_DB        || 'osl';

app.disable('x-powered-by');
app.use(express.static('client/dist'));
app.use(express.json());

mongoose.connect(`mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DB}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
// https://mongoosejs.com/docs/deprecations.html
mongoose.set('useFindAndModify', false);

/*****************************************************************************/

const ListSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuid.v4,
    immutable: true
  },
  name: {
    type: String,
    required: true
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  // https://mongoosejs.com/docs/tutorials/virtuals.html#virtuals-in-json
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});
// https://mongoosejs.com/docs/tutorials/virtuals.html
ListSchema.virtual('items', {
  ref: 'Item',
  localField: '_id',
  foreignField: 'listId',
});
ListSchema.pre('save', function() {
  // < v1.0.2 format compatibility hook
  if (!this.createdAt && this.creationDate) {
    this.createdAt = this.creationDate;
  }
  this.set('creationDate', undefined, { strict: false });
  if (!this.updatedAt && this.lastModificationDate) {
    this.updatedAt = this.lastModificationDate;
  }
  this.set('lastModificationDate', undefined, { strict: false });
});
const List = mongoose.model('List', ListSchema);

const ItemSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuid.v4,
    immutable: true
  },
  listId: {
    type: String,
    ref: 'List'
  },
  name: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: false
  },
  qty: {
    type: Number,
    default: 1
  },
  checked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  // https://mongoosejs.com/docs/tutorials/virtuals.html#virtuals-in-json
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});
ItemSchema.pre('save', function() {
  // < v1.0.2 format compatibility hook
  if (!this.createdAt && this.creationDate) {
    this.createdAt = this.creationDate;
  }
  this.set('creationDate', undefined, { strict: false });
  if (!this.updatedAt && this.lastModificationDate) {
    this.updatedAt = this.lastModificationDate;
  }
  this.set('lastModificationDate', undefined, { strict: false });
});
const Item = mongoose.model('Item', ItemSchema);

/*****************************************************************************/

// ============================================================================
// WEBSOCKET
// ============================================================================
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


// ============================================================================
// LISTS
// ============================================================================

// NOTICE: Should *not* be available in production mode when accounts will be implemented
app.get('/lists', (req, res) => {
  List
    .find({})
    //.populate('items')
    .exec(function (err, docs) {
      if (err) throw err;
      console.log(docs)
      res.status(200)
        .json(docs);
    });
});

app.head('/lists/:id', (req, res) => {
  const id = req.params.id;

  List
    .findOne({
      _id: id
    })
    .exec(function (err, doc) {
      if (err) throw err;
      if (doc) {
        console.log(doc._id, 'updatedAt =', doc.updatedAt);
        res.status(200)
          .set('Last-Modified-Iso', doc.updatedAt ? doc.updatedAt.toISOString() : (new Date(0)).toISOString())
          .end();
      } else {
        res.status(404)
          .end();
      }
    });
});

app.get('/lists/:id', (req, res) => {
  const id = req.params.id;

  List
    .findOne({
      _id: id
    })
    .populate('items')
    .exec(function (err, doc) {
      if (err) throw err;
      if (doc) {
        console.log(doc);
        res.status(200)
          .json(doc);
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

app.post('/lists', (req, res) => {
  delete req.body._id;
  const doc = new List(req.body);
  console.debug('POST LIST', doc);

  doc.save(function (err) {
    if (err) throw err;
    res.status(201)
      .json(doc);
    notifyModelUpdate('List', doc);
  });
});

app.patch('/lists/:id', (req, res) => {
  const id = req.params.id;
  console.debug('PATCH LIST', id, req.body);

  List.findById(id, function (err, list) {
    if (err) throw err;
    if (list) {
      for (f in req.body) {
        list[f] = req.body[f];
      }
      list.save(function (err) {
        if (err) throw err;
        res.status(200)
          .json(list);
        notifyModelUpdate('List', list);
      })
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

app.delete('/lists/:id', (req, res) => {
  const id = req.params.id;
  console.debug('DELETE LIST', id, req.body);

  List.findById(id, function (err, list) {
    if (err) throw err;
    if (list) {
      list.delete(function (err) {
        if (err) throw err;
        res.status(200)
          .json(list);
        notifyModelDelete('List', list);
      })
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

// ============================================================================
// ITEMS
// ============================================================================

// NOTICE: Should *not* be available in production mode
app.get('/items', (req, res) => {
  Item.find({}, function (err, docs) {
    if (err) throw err;
    console.log(docs)
    res.status(200)
      .json(docs);
  });
});

app.get('/lists/:listId/items', (req, res) => {
  const listId = req.params.listId;

  List.findOne({
    _id: listId
  }, function (err, doc) {
    if (err) throw err;
    if (doc) {
      Item.find({
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

app.post('/items', (req, res) => {
  delete req.body._id;
  const doc = new Item(req.body);
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

    List.findById(doc.listId, function (err, list) {
      list.markModified('items');
      list.save();
    });
  }
});

app.post('/lists/:listId/items', (req, res) => {
  const listId = req.params.listId;

  List.findById(listId, function (err, list) {
    if (err) throw err;
    if (list) {
      let itemData = req.body;
      const item = new Item(itemData);
      item.listId = list._id;
      console.debug('POST ITEM IN LIST', list, item);
      item.save(function (err) {
        if (err) throw err;
        res.status(201)
          .json(item);
        notifyModelUpdate('Item', item);
      });

      // Force update list
      list.markModified('items');
      list.save();
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

app.patch('/items/:id', (req, res) => {
  const id = req.params.id;
  console.debug('PATCH ITEM', id, req.body);

  Item.findById(id, function (err, item) {
    if (err) throw err;
    if (item) {
      for (f in req.body) {
        item[f] = req.body[f];
      }
      item.save(function (err) {
        if (err) throw err;
        res.status(200)
          .json(item);
        notifyModelUpdate('Item', item);
      });

      List.findById(item.listId, function (err, list) {
        list.markModified('items');
        list.save();
      });
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

app.patch('/lists/:listId/items/:itemId', (req, res) => {
  const itemId = req.params.itemId;
  console.debug('PATCH ITEM', itemId, req.body);

  Item.findOneAndUpdate({
    _id: itemId
  }, req.body, {
    new: true
  }, function (err, doc) {
    if (err) throw err;
    if (doc) {
      res.status(200)
        .json(doc);
      notifyModelUpdate('Item', doc);

      List.findById(doc.listId, function (err, list) {
        list.markModified('items');
        list.save();
      });
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

app.delete('/items/:id', (req, res) => {
  const id = req.params.id;
  console.debug('DELETE ITEM', id, req.body);
  Item.findById(id, function (err, item) {
    if (err) throw err;
    if (item) {
      item.delete(function (err) {
        if (err) throw err;
        res.status(200)
          .json(item);
        notifyModelDelete('Item', item);
      });

      List.findById(item.listId, function (err, list) {
        list.markModified('items');
        list.save();
      });
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

/*****************************************************************************/

app.use(function (err, req, res, next) {
  console.error('[500]', err.stack);
  res.status(500).json({
    error: err
  });
});
app.use(function (req, res, next) {
  console.error('[404]', `${req.method} ${req.path}`);
  res.status(404)
    .json({
      error: {
        message: `Invalid request: ${req.method} ${req.path}`
      }
    });
});
const server = http.listen(LISTEN_PORT, () => {
  console.info(`OSL Server started on ${server.address().address}:${server.address().port}`);
});
