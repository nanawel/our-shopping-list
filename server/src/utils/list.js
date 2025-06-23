const BoardModel = require('../board/model');
const ListModel = require('../list/model');
const {VITE_SINGLEBOARD_ID} = require("../config");

module.exports = {
  /**
   * @param {Array|String} listIds
   * @param {String} boardSlug
   * @returns {Promise<Query<UpdateResult, any, {}, any>>}
   */
  async moveToBoard(listIds, boardSlug) {
    if (listIds === '*') {
      listIds = [];
      for await (const list of ListModel.find()) {
        listIds.push(list._id);
      }
    }
    if (!boardSlug) {
      throw new Error('Missing board slug.');
    }

    const board = await BoardModel.findOne({slug: boardSlug});
    if (!board) {
      throw new Error('Invalid board slug.');
    }

    const targeListIds = (await ListModel.find({_id: {$in: listIds}}))
      .map((l) => l._id);

    return ListModel.updateMany(
      {_id: {$in: targeListIds}},
      {boardId: board._id}
    );
  }
}
