const ListModel = require('../list/model');

module.exports = {
  /**
   * @param {Object} filter
   */
  async getLists(filter) {
    return ListModel.find(filter);
  }
}
