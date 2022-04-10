const ItemModel = require('../item/model');

module.exports = {
  /**
   *
   * @param {Item[]|String[]} items
   * @param {List|String} list
   * @returns {Promise<Query<UpdateResult, any, {}, any>>}
   */
  async moveToList(items, list) {
    const itemIds = items.map((i) => typeof i === 'string' ? i : i._id);
    const listId = typeof list === 'string' ? list : list._id;

    return ItemModel.updateMany(
      {_id: {$in: itemIds}},
      {listId: listId}
    );
  }
}
