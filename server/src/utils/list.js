const BoardModel = require('../board/model');
const ListModel = require('../list/model');
const {VUE_APP_SINGLEBOARD_ID} = require("../config");

module.exports = {
  /**
   * @param {Object} filter
   */
  async getLists(filter) {
    return ListModel.find(filter);
  },
  /**
   * @param {Array|String} listIds
   * @param {String} boardSlug
   * @returns {Promise<Query<UpdateResult, any, {}, any>>}
   */
  async moveToBoard(listIds, boardSlug) {
    const withListFilter = listIds && listIds.length;

    //
    // TODO
    //

    let targetLists;
    if (withListFilter) {
      targetLists = await ListModel.find({_id: {$in: listIds}});
    } else {
      const boardlessLists = await ListModel.find({boardId: null});

      if (boardlessLists.length) {
        targetLists = boardlessLists;
      } else {
        console.warn('No boardless list found. Expanding search to *all* lists.');
        if (!force) {
          throw new Error('You must use force the migration if you want to migrate all lists.');
        }
        targetLists = await ListModel.find();
      }
    }

    const targeListIds = targetLists.map((l) => l._id);

    return ListModel.updateMany(
      {_id: {$in: targeListIds}},
      {boardId: VUE_APP_SINGLEBOARD_ID}
    );
  }
}
