import eventBus from '@/service/event-bus'
import {store} from '@/service/store'
import {repository} from '@/service/repository'
import {snackbar} from '@/service/snackbar'

import ListModel from '@/models/List'

export default {
  install() {
    // Assign current board to each newly created list
    eventBus.$on('repository_save::before', function (model) {
      if (model instanceof ListModel
        && store.state.board?.currentBoardId
      ) {
        model.boardId = store.state.board.currentBoardId
      }
    })

    store.watch(
      (state) => state.list?.currentList,
      (newValue) => {
        if (newValue) {
          repository.checkSync(newValue)
            .catch((e) => {
              snackbar.showMessage(e.reason || `Sync error: ${e}`)
            })
        }
      }
    )

    eventBus.$on('ws::connected', function () {
      if (store.state.list?.currentList) {
        repository.checkSync(store.state.list.currentList)
          .catch((e) => {
            snackbar.showMessage(e.reason || `Sync error: ${e}`)
          })
      }
    })
  }
}
