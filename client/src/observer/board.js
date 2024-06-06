import eventBus from '@/service/event-bus'
import {socket} from '@/service/socket-io'
import {store} from '@/service/store'
import {repository} from '@/service/repository'
import {snackbar} from '@/service/snackbar'
import {logger} from '@/service/logger'

export default {
  install() {
    store.watch(
      (state) => state.board?.currentBoardId,
      (newValue, oldValue) => {
        logger.debug(`observer/board :: Updating from ${oldValue} to ${newValue}`)
        if (oldValue) {
          socket.emit('leave-board', oldValue)
        }
        if (newValue) {
          socket.emit('join-board', newValue)

        }
      }
    )

    store.watch(
      (state) => state.board?.currentBoard,
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
      if (store.state.board?.currentBoard) {
        repository.checkSync(store.state.board.currentBoard)
          .catch((e) => {
            logger.error(e)
            snackbar.showMessage('❌ ' + (e.reason || `Sync error: ${e}`))
          })
      }
    })
  }
}
