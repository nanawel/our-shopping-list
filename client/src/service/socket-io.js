import path from 'path-browserify'
import { io } from 'socket.io-client'

import config from '@/config'
import {logger} from '@/service/logger'

const sock = io({
  path: path.normalize(`/${config.BASE_URL}socket.io/`),  // Custom web root support (#58/GITHUB#18)

  // https://socket.io/docs/v4/client-options/#transports
  //transports: ['polling', 'websocket', 'webtransport'], // Keep default
  // https://socket.io/docs/v4/client-options/#upgrade
  //upgrade: true
})

sock.on('connect_error', (err) => {
  logger.error('[socket-io] Connection error:', err)
});

export {
  sock
}
