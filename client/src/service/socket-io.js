import { io } from 'socket.io-client'

const sock = io({
  transports: ['websocket', 'polling']
})

sock.on('connect_error', () => {
  sock.io.opts.transports = ['polling', 'websocket'];
});

export {
  sock
}
