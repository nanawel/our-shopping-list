const {router} = require('../app');

const ListModel = require('../list/model');
const ItemModel = require('./model');

router.get('/items', (req, res, next) => {
  if (process.env.APP_ENV === 'production') {
    res.status(403)
      .json({
        error: {
          message: 'Not available in production mode!'
        }
      });
  } else {
    ItemModel.find({})
      .then((docs) => {
        res.status(200)
          .json(docs);
      })
      .catch(next);
  }
});

router.get('/lists/:listId/items', (req, res, next) => {
  const listId = req.params.listId;

  ListModel
    .findById(listId)
    .then((doc) => {
      if (doc) {
        ItemModel
          .find({
            listId: listId
          })
          .then((docs) => {
            res.status(200)
              .json(docs);
          })
          .catch(next);
      } else {
        res.status(404)
          .json({
            error: {
              message: 'List not found'
            }
          });
      }
    })
    .catch(next);
});

router.post('/items', (req, res, next) => {
  delete req.body._id;
  const doc = new ItemModel(req.body);
  console.debug('POST ITEM', doc);

  if (!doc.listId) {
    res.status(400)
      .json({
        error: {
          message: 'Missing parent list for item'
        }
      });
  } else {
    doc.save()
      .then(() => {
        res.status(201)
          .json(doc);
      })
      .catch(next);
  }
});

router.post('/lists/:listId/items', (req, res, next) => {
  const listId = req.params.listId;

  ListModel
    .findById(listId)
    .then((list) => {
      if (list) {
        let itemData = req.body;
        const item = new ItemModel(itemData);
        item.listId = list._id;
        console.debug('POST ITEM IN LIST', list, item);
        item.save()
          .then((item) => {
            res.status(201)
              .json(item);
          })
          .catch(next);
      } else {
        res.status(404)
          .json({
            error: {
              message: 'List not found'
            }
          });
      }
    })
    .catch(next);
});

router.patch('/items/:id', (req, res, next) => {
  const id = req.params.id;
  console.debug('PATCH ITEM', id, req.body);

  ItemModel
    .findById(id)
    .then((item) => {
      if (item) {
        Object.assign(item, req.body);
        item.save()
          .then((item) => {
            res.status(200)
              .json(item);
          })
          .catch(next);
      } else {
        res.status(404)
          .json({
            error: {
              message: 'Item not found'
            }
          });
      }
    })
    .catch(next);
});

router.delete('/items/:id', (req, res, next) => {
  const id = req.params.id;
  console.debug('DELETE ITEM', id, req.body);
  ItemModel
  .findByIdAndDelete(id)
  .then((item) => {
    if (item) {
      console.debug('ITEM DELETED', item);
      res.status(200)
        .json(item);
    } else {
      res.status(404)
        .json({
          error: {
            message: 'Item not found'
          }
        });
    }
  })
  .catch(next);
});
