import eventBus from '@/service/event-bus'
import {socket} from "@/service/socket-io"

export default {
  install() {
    eventBus.$on('board_set::after', function (board, previousBoard) {
      if (board && board._id) {
        socket.emit('join-board', board._id)
      } else if (previousBoard && previousBoard._id) {
        socket.emit('leave-board', previousBoard._id)
      }
    })
  }
}
