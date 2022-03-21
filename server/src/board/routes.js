const {router} = require('../app');

const BoardModel = require('./model');

router.head('/boards/:boardId', (req, res) => {
  const boardId = req.params.boardId;

  BoardModel
    .findOne({
      _id: boardId
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

router.head('/boards/by-slug/:slug', (req, res) => {
  const slug = req.params.slug;

  BoardModel
    .findOne({
      slug: slug
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
        console.log(doc);
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
        console.log(doc);
        res.status(200)
          .json(doc);
      } else {
        const doc = new BoardModel(req.body);
        console.debug('GET BOARD (create new)', doc);
        doc.save(function (err) {
          if (err) throw err;
          res.status(201)
            .json(doc);
        });
      }
    });
});

router.post('/boards', (req, res) => {
  delete req.body._id;
  const doc = new BoardModel(req.body);
  console.debug('POST BOARD', doc);

  doc.save(function (err) {
    if (err) throw err;
    res.status(201)
      .json(doc);
  });
});

router.get('/boards/:slug/lists', (req, res) => {
  const slug = req.params.slug;

  BoardModel
    .findOne({
      slug: slug
    })
    .populate('lists')
    .exec(function (err, doc) {
      if (err) throw err;
      if (doc) {
        console.log(doc);
        res.status(200)
          .json(doc.lists);
      } else {
        let boardData = req.body;
        boardData.name = boardData.name || slug;

        const doc = new BoardModel(boardData);
        console.debug('GET BOARD LISTS (create new)', doc);
        doc.save(function (err) {
          if (err) throw err;
          res.status(201)
            .json(doc.lists);
        });
      }
    });
});
