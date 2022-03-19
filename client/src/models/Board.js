import slugify from 'slugify'

import AbstractModel from './AbstractModel'
import List from './List'

class Board extends AbstractModel {
  static entity = 'boards'

  static primaryKey = '_id'

  static fields () {
    return {
      _id: this.attr(null),
      slug: this.attr(''),
      name: this.attr(''),
      creationDate: this.attr(''),
      createdAt: this.attr(null),
      updatedAt: this.attr(null),

      lists: this.hasMany(List, 'boardId')
    }
  }

  static getSlugFromName(name) {
    return slugify(name)
  }
}

export default Board
