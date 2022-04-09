const {VUE_APP_SINGLEBOARD_ID, VUE_APP_SINGLEBOARD_SLUG} = require('../config');
const BoardModel = require('../board/model');
const ListModel = require("../list/model");

const deniedReasonHeader = 'Not-In-Singleboard-Mode';

const ensureSingleBoardExists = async function () {
  return await BoardModel
    .findById(VUE_APP_SINGLEBOARD_ID)
    .exec()
    .then(function (err, doc) {
      if (err) throw err;
      if (!doc) {
        console.info('Singleboard does not exist. Force creation.');

        // Force create the board before continuing
        return (new BoardModel({
          _id: VUE_APP_SINGLEBOARD_ID,
          slug: VUE_APP_SINGLEBOARD_SLUG
        })).save();
      }
    });
};

const getList = async function (listId) {
  return await ListModel
    .findById(listId)
    .exec()
    .then((doc) => {
      if (doc && doc.boardId !== VUE_APP_SINGLEBOARD_ID) {
        throw new Error(deniedReasonHeader);
      } else {
        return doc;
      }
    });
};

module.exports = (router) => {
  //
  //  BOARDS MIDDLEWARE INTERCEPTORS
  //
  // HEAD + GET
  router.all('/boards/by-slug/:slug', function(req, res, next) {
    res.redirect(307, `/boards/${VUE_APP_SINGLEBOARD_ID}`);
  });
  // HEAD + GET
  router.all('/boards/:boardId', function(req, res, next) {
    if (req.params.boardId !== VUE_APP_SINGLEBOARD_ID) {
      res.status(404)
        .set('Osl-Reason', deniedReasonHeader)
        .end();
    } else {
      ensureSingleBoardExists()
        .then(() => next())
        .catch((err) => {
          console.error(err);
        });
      next();
    }
  });

  //
  //  LISTS MIDDLEWARE INTERCEPTORS
  //
  // HEAD + GET
  const headGetListMiddleware = (req, res, next) => {
    const id = req.params.id;

    getList(id)
      .then((list) => {
        next();
      })
      .catch((err) => {
        res.status(404)
          .set('Osl-Reason', err)
          .end();
      });
  };
  router.head('/lists/:id', headGetListMiddleware);
  router.get('/lists/:id', headGetListMiddleware);

  // POST
  router.post('/lists', (req, res, next) => {
    if (req.body && req.body.boardId !== VUE_APP_SINGLEBOARD_ID) {
      res.status(403)
        .set('Osl-Reason', deniedReasonHeader)
        .end();
    } else {
      next();
    }
  });

  // PATCH
  router.patch('/lists', (req, res, next) => {
    if (req.body && req.body.boardId !== VUE_APP_SINGLEBOARD_ID) {
      res.status(403)
        .set('Osl-Reason', deniedReasonHeader)
        .end();
    } else {
      next();
    }
  });

  //
  //  ITEMS MIDDLEWARE INTERCEPTORS
  //
  // TODO
}
