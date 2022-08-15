const {router} = require('../app');

const ListModel = require('./model');

router.head('/lists/:id', (req, res, next) => {
  const id = req.params.id;

  ListModel
    .findById(id)
    .exec()
    .then((doc) => {
      if (doc) {
        console.log('HEAD LIST', doc._id, 'updatedAt =', doc.updatedAt);
        res.status(204)
          .set('Last-Modified-Iso', doc.updatedAt ? doc.updatedAt.toISOString() : (new Date(0)).toISOString())
          .set('Osl-Entity-Type', ListModel.modelName)
          .set('Osl-Entity-Id', doc._id)
          .end();
      } else {
        res.status(404)
          .end();
      }
    })
    .catch(next);
});

router.get('/lists', (req, res, next) => {
  if (process.env.APP_ENV === 'production') {
    res.status(403)
      .json({
        error: {
          message: "Not available in production mode!"
        }
      });
  } else {
    ListModel
      .find({})
      .then((docs) => {
        console.log('GET LISTS', docs)
        res.status(200)
          .json(docs);
      })
      .catch(next);
  }
});

router.get('/lists/:id', (req, res, next) => {
  const id = req.params.id;

  ListModel
    .findById(id)
    .populate('items')
    .exec()
    .then((doc) => {
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
    })
    .catch(next);
});

router.post('/lists', (req, res, next) => {
  delete req.body._id;
  const list = new ListModel(req.body);
  console.debug('POST LIST', list);

  list.save()
    .then((list) => {
      res.status(201)
        .json(list);
    })
    .catch(next);
});

router.patch('/lists/:id', (req, res, next) => {
  const id = req.params.id;
  console.debug('PATCH LIST', id, req.body);

  ListModel
    .findById(id)
    .exec()
    .then((list) => {
      if (list) {
        for (f in req.body) {
          list[f] = req.body[f];
        }
        list.save()
          .then((list) => {
            res.status(200)
              .json(list);
          })
          .catch(next);
      } else {
        res.status(404)
          .json({
            error: {
              message: "List not found"
            }
          });
      }
    })
    .catch(next);
});

router.delete('/lists/:id', (req, res, next) => {
  const id = req.params.id;
  console.debug('DELETE LIST', id, req.body);

  ListModel
    .findById(id)
    .then((list) => {
      if (list) {
        list.delete()
          .then(() => {
            res.status(200)
              .json(list);
          })
          .catch(next);
      } else {
        res.status(404)
          .json({
            error: {
              message: "List not found"
            }
          });
      }
    })
    .catch(next);
});
