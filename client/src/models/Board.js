import slugify from 'slugify'

import AbstractModel from './AbstractModel'
import List from './List'

class Board extends AbstractModel {
  static entity = 'boards'

  static primaryKey = '_id'

  static fields () {
    return {
      _id: this.string(null),
      slug: this.string(''),
      name: this.string(''),
      creationDate: this.attr(''),
      createdAt: this.attr(null),
      updatedAt: this.attr(null),

      lists: this.hasMany(List, 'boardId')
    }
  }

  static getSlugFromName(name) {
    return slugify(name, {lower: true})
  }
}

export default Board
