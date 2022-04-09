const {router} = require('../app');

const ListModel = require('./model');

router.head('/lists/:id', (req, res) => {
  const id = req.params.id;

  ListModel
    .findById(id)
    .exec(function (err, doc) {
      if (err) throw err;
      if (doc) {
        console.log('HEAD LIST', doc._id, 'updatedAt =', doc.updatedAt);
        res.status(200)
          .set('Last-Modified-Iso', doc.updatedAt ? doc.updatedAt.toISOString() : (new Date(0)).toISOString())
          .set('Osl-Entity-Type', ListModel.modelName)
          .set('Osl-Entity-Id', doc._id)
          .end();
      } else {
        res.status(404)
          .end();
      }
    });
});

router.get('/lists', (req, res) => {
  if (process.env.APP_ENV === 'production') {
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
    .findById(id)
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
  });
});

router.patch('/lists/:id', (req, res) => {
  const id = req.params.id;
  console.debug('PATCH LIST', id, req.body);

  ListModel
    .findOne({
      _id: id
    })
    .exec(function (err, list) {
      if (err) throw err;
      if (list) {
        for (f in req.body) {
          list[f] = req.body[f];
        }
        list.save(function (err) {
          if (err) throw err;
          res.status(200)
            .json(list);
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
