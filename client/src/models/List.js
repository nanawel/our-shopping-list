import AbstractModel from './AbstractModel'
import Board from './Board'
import Item from './Item'

class List extends AbstractModel {
  static entity = 'lists'

  static primaryKey = '_id'

  static fields () {
    return {
      ...super.fields(),
      _id: this.string(null),
      name: this.string(''),
      creationDate: this.attr(''),
      createdAt: this.attr(null),
      updatedAt: this.attr(null),
      boardId: this.string(null),

      board: this.belongsTo(Board, 'boardId'),
      items: this.hasMany(Item, 'listId')
    }
  }
}

export default List
