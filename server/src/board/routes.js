const {router} = require('../app');

const BoardModel = require('./model');
require('./ws');

const onHeadRequest = function (req, res, err, doc) {
  if (err) throw err;
  if (doc) {
    console.log('HEAD BOARD', doc._id, 'updatedAt =', doc.updatedAt);
    res.status(200)
      .set('Last-Modified-Iso', doc.updatedAt ? doc.updatedAt.toISOString() : (new Date(0)).toISOString())
      .set('Osl-Entity-Type', BoardModel.modelName)
      .set('Osl-Entity-Id', doc._id);
  } else {
    res.status(404);
  }
}

router.head('/boards/:boardId', (req, res) => {
  BoardModel
    .findOne({
      _id: req.params.boardId
    })
    .exec((err, doc) => onHeadRequest(req, res, err, doc));
});
router.head('/boards/by-slug/:slug', (req, res) => {
  BoardModel
    .findOne({
      slug: req.params.slug
    })
    .exec((err, doc) => onHeadRequest(req, res, err, doc));
});

router.get('/boards/:boardId', (req, res) => {
  const boardId = req.params.boardId;

  BoardModel
    .findOne({
      _id: boardId
    })
    .populate('lists')
    .exec(function (err, doc) {
      if (err) throw err;
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
    });
});

router.get('/boards/by-slug/:slug', (req, res) => {
  const slug = req.params.slug;

  BoardModel
    .findOne({
      slug: slug
    })
    .populate('lists')
    .exec(function (err, doc) {
      if (err) throw err;
      if (doc) {
        console.log('GET BOARD', doc);
        res.status(200)
          .json(doc);
      } else {
        const doc = new BoardModel({slug: slug});
        console.debug('GET BOARD (create new)', doc);
        doc.save(function (err) {
          if (err) throw err;
          res.status(201)
            .json(doc);
        });
      }
    });
});

router.get('/boards/:boardId/lists', (req, res) => {
  res.status(501)
    .end();
});

router.get('/boards/by-slug/:slug/lists', (req, res) => {
  res.status(501)
    .end();
});
