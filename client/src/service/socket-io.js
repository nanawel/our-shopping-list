import { io } from 'socket.io-client'

import logger from '@/service/logger'

const sock = io({
  path: window.location.pathname.replace('/+$', '/') + 'socket.io/',  // #58/GITHUB#18
  transports: ['websocket', 'polling']
})

sock.on('connect_error', (err) => {
  logger.error('[socket-io] Connection error:', err)
  sock.io.opts.transports = ['polling', 'websocket']
});

export {
  sock
}
