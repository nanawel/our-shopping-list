const {router} = require('../app');
const {notifyModelUpdate, notifyModelDelete} = require('../ws');

const ListModel = require('./model');

// NOTICE: Should *not* be available in production mode when accounts will be implemented
router.get('/lists', (req, res) => {
  ListModel
    .find({})
    //.populate('items')
    .exec(function (err, docs) {
      if (err) throw err;
      console.log(docs)
      res.status(200)
        .json(docs);
    });
});

router.head('/lists/:id', (req, res) => {
  const id = req.params.id;

  ListModel
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

router.post('/lists', (req, res) => {
  delete req.body._id;
  const doc = new ListModel(req.body);
  console.debug('POST LIST', doc);

  doc.save(function (err) {
    if (err) throw err;
    res.status(201)
      .json(doc);
    notifyModelUpdate('List', doc);
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
