export default {
  namespaced: true,
  state: () => ({
    title: '',
    message: '',
    closeButtonLabel: ''
  }),
  mutations: {
    showMessage (state, payload) {
      state.title = payload.title
      state.message = payload.message
      state.closeButtonLabel = payload.closeButtonLabel
    },
    close () {}
  }
}
