import AbstractModel from './AbstractModel'
import Item from './Item'

class List extends AbstractModel {
  static entity = 'lists'

  static primaryKey = '_id'

  static fields () {
    return {
      _id: this.attr(null),
      name: this.attr(''),
      creationDate: this.attr(''),

      items: this.hasMany(Item, 'listId')
    }
  }
}

export default List
