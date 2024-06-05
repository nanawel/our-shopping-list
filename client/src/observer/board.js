import {socket} from '@/service/socket-io'
import {store} from '@/service/store'
import {logger} from '@/service/logger'

export default {
  install() {
    store.watch(
      (state) => state.board?.currentBoardId,
      (newValue, oldValue) => {
        logger.debug(`observer/board :: Updating from ${oldValue} to ${newValue}`);
        if (oldValue) {
          socket.emit('leave-board', oldValue)
        }
        if (newValue) {
          socket.emit('join-board', newValue)
        }
      }
    )
  }
}
