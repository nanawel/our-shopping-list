import path from 'path-browserify'
import {Manager} from 'socket.io-client/debug'

import config from '@/config'
import {logger} from '@/service/logger'

const manager = new Manager({
  path: path.normalize(`/${config.BASE_URL}socket.io/`),  // Custom web root support (#58/GITHUB#18)
  closeOnBeforeunload: true,
  reconnectionDelayMax: 2000,
  timeout: 4000,

  // https://socket.io/docs/v4/client-options/#transports
  transports: config.VUE_APP_SOCKETIO_TRANSPORTS.split(',') || ['websocket'],

  // https://socket.io/docs/v4/client-options/#upgrade
  //upgrade: true
})
const socket = manager.socket('/')

socket.on('connect_error', (err) => {
  logger.error('[socket.io] Connection error:', err)
})
socket.on('disconnect', () => {
  logger.info('[socket.io] Disconnected')
})

manager.on('reconnect_attempt', () => {
  logger.info('[socket.io] Attempting to reconnect...')
})
manager.on('reconnect', (n) => {
  logger.info(`[socket.io] Reconnected after ${n} attempt(s)`)
})
manager.on('reconnect_error', (err) => {
  logger.error('[socket.io] Reconnection error:', err)
})
manager.on('reconnect_failed', () => {
  logger.error('[socket.io] Reconnection failed :(')
})

export {
  socket,
  manager
}
