const {router, SINGLEBOARD_MODE} = require('../app');
const {notifyModelUpdate, notifyModelDelete} = require('../ws');

const BoardModel = require('../board/model');
const ListModel = require('./model');

router.head('/lists/:id', (req, res) => {
  const id = req.params.id;

  ListModel
    .findOne({
      _id: id
    })
    .exec(function (err, doc) {
      if (err) throw err;
      if (doc) {
        console.log('HEAD LIST', doc._id, 'updatedAt =', doc.updatedAt);
        res.status(200)
          .set('Last-Modified-Iso', doc.updatedAt ? doc.updatedAt.toISOString() : (new Date(0)).toISOString())
          .end();
      } else {
        res.status(404)
          .end();
      }
    });
});

router.get('/lists', (req, res) => {
  if (!SINGLEBOARD_MODE && process.env.APP_ENV === 'production') {
    res.status(403)
      .json({
        error: {
          message: "Not available in production mode!"
        }
      });
  } else {
    ListModel.find({}, function (err, docs) {
      if (err) throw err;
      console.log('GET LISTS', docs)
      res.status(200)
        .json(docs);
    });
  }
});

router.get('/lists/:id', (req, res) => {
  const id = req.params.id;

  ListModel
    .findOne({
      _id: id
    })
    .populate('items')
    .exec(function (err, doc) {
      if (err) throw err;
      if (doc) {
        console.log('GET LIST', doc);
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

router.post('/lists', (req, res) => {
  delete req.body._id;
  const list = new ListModel(req.body);
  console.debug('POST LIST', list);

  list.save(function (err) {
    if (err) throw err;
    res.status(201)
      .json(list);
    notifyModelUpdate('List', list);

    if (list.boardId && SINGLEBOARD_MODE) {
      try {
        BoardModel.findById(list.boardId, function (err, board) {
          board.markModified('lists');
          board.save();
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
});

router.patch('/lists/:id', (req, res) => {
  const id = req.params.id;
  console.debug('PATCH LIST', id, req.body);

  ListModel.findById(id, function (err, list) {
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

      if (list.boardId && SINGLEBOARD_MODE) {
        try {
          BoardModel.findById(list.boardId, function (err, board) {
            board.markModified('lists');
            board.save();
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

router.delete('/lists/:id', (req, res) => {
  const id = req.params.id;
  console.debug('DELETE LIST', id, req.body);

  ListModel.findById(id, function (err, list) {
    if (err) throw err;
    if (list) {
      const boardId = list.boardId;
      list.delete(function (err) {
        if (err) throw err;
        res.status(200)
          .json(list);
        notifyModelDelete('List', list);

        if (boardId && SINGLEBOARD_MODE) {
          try {
            BoardModel.findById(boardId, function (err, board) {
              board.markModified('lists');
              board.save();
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
