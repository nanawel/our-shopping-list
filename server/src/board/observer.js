const bus = require('../bus');

const BoardModel = require('./model');
const ListModel = require('../list/model');

bus.on('model-update', function (doc) {
  if (doc instanceof ListModel) {
    BoardModel
      .findById(doc.boardId)
      .then((board) => {
        board.markModified('lists');
        board.save({
          /** @see https://github.com/blakehaswell/mongoose-unique-validator/issues/88#issuecomment-1063368054 */
          validateModifiedOnly: true,
        });
      });
  }
});

bus.on('model-delete', function (doc) {
  if (doc instanceof ListModel) {
    BoardModel
      .findById(doc.boardId)
      .then((board) => {
        board.markModified('lists');
        board.save({
          /** @see https://github.com/blakehaswell/mongoose-unique-validator/issues/88#issuecomment-1063368054 */
          validateModifiedOnly: true,
        });
      });
  }
});
