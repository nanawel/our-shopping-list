import eventBus from '@/service/event-bus'
import {sock} from "@/service/socket-io";

export default {
  install() {
    // (Pre-)Load lists' items when setting current board
    eventBus.$on('board_set::after', function (board, previousBoard) {
      if (board && board._id) {
        sock.emit('join-board', board._id)
      } else if (previousBoard && previousBoard._id) {
        sock.emit('leave-board', previousBoard._id)
      }
    })
  }
}
