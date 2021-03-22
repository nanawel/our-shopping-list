export default {
  namespaced: true,
  state: () => ({
    content: '',
    color: '',
    timeout: null,
  }),
  mutations: {
    showMessage (state, payload) {
      state.content = payload.content
      state.color = payload.color
      state.timeout = payload.timeout
      state.closeable = typeof payload.closeable !== 'undefined'
        ? !!payload.closeable
        : true
    },
    close (state) {
      state.timeout = 1
    }
  }
}
