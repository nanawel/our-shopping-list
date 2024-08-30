import eventBus from '@/service/event-bus'
import {store} from '@/service/store'
import {router} from '@/router'
import {repository} from '@/service/repository'
import {snackbar} from '@/service/snackbar'
import {logger} from '@/service/logger'

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

    // Exit list page when model is deleted
    eventBus.$on('repository_delete::after', function (model) {
      if (model instanceof ListModel
        && router.currentRoute.value?.params?.listId === model._id
      ) {
        router.push('/board')
      }
    })

    store.watch(
      (state) => state.list?.currentList,
      (newValue) => {
        if (newValue) {
          repository.checkSync(newValue)
            .catch((e) => {
              logger.error(e)
              snackbar.showMessage('❌ ' + (e.reason || `Sync error: ${e}`))
            })
        }
      }
    )

    eventBus.$on('ws::connected', function () {
      if (store.state.list?.currentList) {
        repository.checkSync(store.state.list.currentList)
          .catch((e) => {
            logger.error(e)
            snackbar.showMessage('❌ ' + (e.reason || `Sync error: ${e}`))
          })
      }
    })
  }
}
