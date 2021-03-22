export default {
  install: (Vue, { store }) => {
    if (!store) {
      throw new Error('Please provide vuex store.')
    }

    Vue.prototype.$snackbar = {
      msg: function (content) {
        return this.showMessage({content})
      },
      showMessage: function ({ content = '', color = '', timeout = null, closeable = true}) {
        store.commit(
          'snackbar/showMessage',
          { content, color, timeout, closeable },
          { root: true }
        )
      },
      close: function () {
        store.commit(
          'snackbar/close',
          { root: true }
        )
      }
    }
  },
}
