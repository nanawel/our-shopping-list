import path from 'path-browserify'
import { io } from 'socket.io-client'

import config from '@/config'
import {logger} from '@/service/logger'

const sock = io({
  path: path.normalize(`/${config.BASE_URL}socket.io/`),  // Custom web root support (#58/GITHUB#18)
  transports: ['websocket', 'polling']
})

sock.on('connect_error', (err) => {
  logger.error('[socket-io] Connection error:', err)
  sock.io.opts.transports = ['polling', 'websocket']
});

export {
  sock
}
