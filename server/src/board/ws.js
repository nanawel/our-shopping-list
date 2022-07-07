const {io} = require('../ws');
const bus = require('../bus');

const BoardModel = require('./model');
const ListModel = require('../list/model');
const ItemModel = require('../item/model');

io.on('connection', (socket) => {
  console.log(`[BOARD] Client connected: ${socket.id}`);

  socket.on('join-board', (boardId, callback) => {
    console.log(`Client ${socket.id} joining board ${boardId}`);
    socket.join(`board/${boardId}`)
    if (callback) {
      callback({
        status: 'OK',
        message: `Joined board ${boardId}`
      })
    }
  });

  socket.on('leave-board', (boardId, callback) => {
    console.log(`Client ${socket.id} leaving board ${boardId}`);
    socket.leave(`board/${boardId}`)
    if (callback) {
      callback({
        status: 'OK',
        message: `Left board ${boardId}`
      })
    }
  });
});

/**
 * @return {String|null}
 */
const findParentBoardId = async function(model) {
  switch (true) {
    case model instanceof BoardModel:
      //console.log('model instanceof Board', model);
      return model._id;

    case model instanceof ListModel:
      //console.log('model instanceof List', model);
      return model.boardId;

    case model instanceof ItemModel:
      //console.log('model instanceof Item', model);
      return findParentBoardId(
        await ListModel.findOne({
            _id: model.listId
          })
          .exec()
      );

    default:
      // No parent board for this model
      return null;
  }
}

const notifyBoard = function(boardId, eventName, eventData) {
  console.log('notifyBoard', ...arguments);
  if (boardId) {
    io.to(`board/${boardId}`).emit(eventName, eventData);
  }
}

bus.on('model-update', function (doc) {
  findParentBoardId(doc).then(async (parentBoardId) => {
    console.log(`Found parent board ID for updated ${doc.constructor.modelName}`, doc, parentBoardId);
    notifyBoard(parentBoardId, 'model-update', {
      type: doc.constructor.modelName,
      model: doc
    });
  });
});

bus.on('model-delete', function (doc) {
  findParentBoardId(doc).then(async (parentBoardId) => {
    console.log(`Found parent board ID for deleted ${doc.constructor.modelName}`, doc, parentBoardId);
    notifyBoard(parentBoardId, 'model-delete', {
      type: doc.constructor.modelName,
      model: doc
    });
  });
});
