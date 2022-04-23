import eventBus from '@/service/event-bus'
import store from '@/store'
import repository from '@/service/repository'

import ListModel from '@/models/List'

export default {
  install() {
    // Assign current board to each newly created list
    eventBus.$on('repository_save::before', function (model) {
      if (model instanceof ListModel
        && store.state.board.currentBoardId
      ) {
        model.boardId = store.state.board.currentBoardId
      }
    })

    // (Pre-)Load lists' items when setting current board
    eventBus.$on('board_set::after', function (board) {
      board.lists.forEach((list) => {
        repository.sync(list)
      })
    })
  }
}
