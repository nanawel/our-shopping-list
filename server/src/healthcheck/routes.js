const {app} = require('../app');

const BoardModel = require('../board/model');
const ListModel = require('../list/model');
const ItemModel = require('../item/model');

app.get('/healthcheck', (req, res) => {
  const boardPromise = BoardModel
    .find({})
    .limit(1)
    .exec();
  const listPromise = ListModel
    .find({})
    .limit(1)
    .exec();
  const itemPromise = ItemModel
    .find({})
    .limit(1)
    .exec();

  Promise.all([boardPromise, listPromise, itemPromise]).then(() => {
    res.status(200)
      .json({success: true});
  }).catch(reason => {
    console.error('[500]', reason);
    res.status(500)
      .json({success: false, reason: reason});
  });
});
