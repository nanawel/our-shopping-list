import mitt from 'mitt'

const emitter = mitt()

export default {
  $on(...args) {
    emitter.on(...args)
  },
  $emit(...args) {
    emitter.emit(...args)
  }
}
