const {router} = require('../app');
const config = require('../config');

const BoardModel = require('./model');
require('./ws');

const onHeadRequest = function (req, res, doc, next) {
  if (doc) {
    console.log('HEAD BOARD', doc._id, 'updatedAt =', doc.updatedAt);
    res.status(204)
      .set('Last-Modified-Iso', doc.updatedAt ? doc.updatedAt.toISOString() : (new Date(0)).toISOString())
      .set('Osl-Entity-Type', BoardModel.modelName)
      .set('Osl-Entity-Id', doc._id)
      .end();
  } else {
    res.status(404)
      .end();
  }
}

router.get('/boards', (req, res, next) => {
  if (!config.VUE_APP_LIST_ALL_BOARDS_ENABLED) {
    res.status(403)
      .json({
        error: {
          message: "Not available! See VUE_APP_LIST_ALL_BOARDS_ENABLED."
        }
      });
  } else {
    BoardModel
      .find({})
      .populate('lists', 'name')  // Minimal data here only
      .exec()
      .then((docs) => {
        console.log('GET BOARDS', docs)
        res.status(200)
          .json(docs);
      })
      .catch(next);
  }
});

router.head('/boards/:boardId', (req, res, next) => {
  BoardModel
    .findById(req.params.boardId)
    .exec()
    .then((doc) => onHeadRequest(req, res, doc, next))
    .catch(next);
});
router.head('/boards/by-slug/:slug', (req, res, next) => {
  BoardModel
    .findOne({
      slug: req.params.slug
    })
    .exec()
    .then((doc) => onHeadRequest(req, res, doc, next))
    .catch(next);
});

router.get('/boards/:boardId', (req, res, next) => {
  const boardId = req.params.boardId;

  BoardModel
    .findById(boardId)
    .populate('lists', '-updatedAt')  // Exclude "updatedAt" to allow syncing lists afterward if needed
    .exec()
    .then((doc) => {
      if (doc) {
        console.log('GET BOARD', doc);
        res.status(200)
          .json(doc);
      } else {
        res.status(404)
          .json({
            error: {
              message: "Board not found"
            }
          });
      }
    })
    .catch(next);
});

router.get('/boards/by-slug/:slug', (req, res, next) => {
  const slug = req.params.slug;

  BoardModel
    .findOne({
      slug: slug
    })
    .populate('lists', '-updatedAt')  // Exclude "updatedAt" to allow syncing lists afterward if needed
    .exec()
    .then((doc) => {
      if (doc) {
        console.log('GET BOARD', doc);
        res.status(200)
          .json(doc);
      } else {
        const doc = new BoardModel({slug: slug});
        console.debug('GET BOARD (create new)', doc);
        doc.save()
          .then(() => {
            res.status(201)
              .json(doc);
          })
          .catch(next);
      }
    })
    .catch(next);
});

router.get('/boards/:boardId/lists', (req, res, next) => {
  res.status(501)
    .end();
});

router.get('/boards/by-slug/:slug/lists', (req, res, next) => {
  res.status(501)
    .end();
});

router.delete('/boards/:id', (req, res, next) => {
  if (!config.VUE_APP_BOARD_DELETION_ENABLED) {
    res.status(403)
      .json({
        error: {
          message: "Not available! See VUE_APP_BOARD_DELETION_ENABLED."
        }
      });
  } else {
    const id = req.params.id;
    console.debug('DELETE BOARD', id, req.body);

    // TODO Be able to cascade delete linked lists
    //      or add a dedicated prune command in CLI.

    BoardModel
      .findByIdAndDelete(id)
      .then((board) => {
        if (board) {
          console.debug('BOARD DELETED', board);
          res.status(200)
            .json(board);
        } else {
          res.status(404)
            .json({
              error: {
                message: "Board not found"
              }
            });
        }
      })
      .catch(next);
  }
});
