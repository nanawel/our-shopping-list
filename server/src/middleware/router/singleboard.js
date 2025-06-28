const {VITE_APP_SINGLEBOARD_ID, VITE_APP_SINGLEBOARD_SLUG} = require('../../config');
const BoardModel = require('../../board/model');
const ListModel = require("../../list/model");
const ItemModel = require("../../item/model");

const deniedReasonHeader = 'Not-In-Singleboard-Mode';

const ensureSingleBoardExists = function () {
  return BoardModel
    .findById(VITE_APP_SINGLEBOARD_ID)
    .exec()
    .then((doc) => {
      if (!doc) {
        console.info('Singleboard does not exist. Force creation.');

        // Force create the board before continuing
        return (new BoardModel({
          _id: VITE_APP_SINGLEBOARD_ID,
          slug: VITE_APP_SINGLEBOARD_SLUG
        })).save();
      }
    });
};

const getList = async function (listId) {
  return await ListModel
    .findById(listId)
    .exec()
    .then((doc) => {
      if (doc && doc.boardId !== VITE_APP_SINGLEBOARD_ID) {
        throw new Error(deniedReasonHeader);
      }
      return doc;
    });
};

const getItem = async function (itemId) {
  return await ItemModel
    .findById(itemId)
    .exec()
    .then((doc) => {
      if (doc) {
        if (!doc.listId) {
          throw new Error(deniedReasonHeader);
        }
        getList(doc.listId);
      }
      return doc;
    });
};

module.exports = (router) => {
  //
  //  BOARDS MIDDLEWARE INTERCEPTORS
  //
  // HEAD + GET
  router.all('/boards/by-slug/:slug', function(req, res, next) {
    console.log('REDIRECT', '/boards/by-slug/:slug');
    res.redirect(307, `/boards/${VITE_APP_SINGLEBOARD_ID}`);
  });
  // HEAD + GET
  router.all('/boards/:boardId', function(req, res, next) {
    if (req.params.boardId !== VITE_APP_SINGLEBOARD_ID) {
      res.status(403)
        .set('Osl-Reason', deniedReasonHeader)
        .end();
    } else {
      ensureSingleBoardExists()
        .then(() => next())
        .catch((err) => {
          res.status(500)
            .set('Osl-Reason', err)
            .end();
        });
    }
  });

  //
  //  LISTS MIDDLEWARE INTERCEPTORS
  //
  // HEAD + GET + DELETE
  const listRequestMiddleware = (req, res, next) => {
    const listId = req.params.listId;

    getList(listId)
      .then((list) => {
        next();
      })
      .catch((err) => {
        res.status(403)
          .set('Osl-Reason', err)
          .end();
      });
  };
  router.head('/lists/:listId', listRequestMiddleware);
  router.get('/lists/:listId', listRequestMiddleware);

  // POST
  router.post('/lists', (req, res, next) => {
    if (req.body && req.body.boardId !== VITE_APP_SINGLEBOARD_ID) {
      res.status(403)
        .set('Osl-Reason', deniedReasonHeader)
        .end();
    } else {
      next();
    }
  });

  // PATCH
  router.patch('/lists', (req, res, next) => {
    if (req.body && req.body.boardId !== VITE_APP_SINGLEBOARD_ID) {
      res.status(403)
        .set('Osl-Reason', deniedReasonHeader)
        .end();
    } else {
      next();
    }
  });

  // DELETE
  router.delete('/lists/:listId', listRequestMiddleware);

  //
  //  ITEMS MIDDLEWARE INTERCEPTORS
  //
  // PATCH + DELETE
  const itemRequestMiddleware = (req, res, next) => {
    const itemId = req.params.itemId;

    getItem(itemId)
      .then(() => {
        next();
      })
      .catch((err) => {
        res.status(403)
          .set('Osl-Reason', err)
          .end();
      });
  };

  // GET
  router.get('/lists/:listId/items', listRequestMiddleware);

  // POST
  router.post('/lists/:listId/items', listRequestMiddleware);
  router.post('/items', (req, res, next) => {
    if (req.body && req.body.listId) {
      getList(req.body.listId)
        .then(() => {
          next();
        })
        .catch((err) => {
          res.status(403)
            .set('Osl-Reason', err)
            .end();
        });
    } else {
      next();
    }
  });

  // PATCH
  router.patch('/items/:itemId', itemRequestMiddleware);

  // DELETE
  router.delete('/items/:itemId', itemRequestMiddleware);
}
