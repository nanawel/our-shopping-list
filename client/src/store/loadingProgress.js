import axios from "axios";

export default {
  namespaced: true,
  state: () => ({
    requestsInProgress: 0,
  }),
  actions: {
    init (context) {
      context.commit('reset')

      // See https://axios-http.com/docs/interceptors
      axios.interceptors.request.use(function (config) {
        context.commit('notifyRequest')
        return config
      })
      axios.interceptors.response.use(function (response) {
        context.commit('notifyResponse')
        return response
      })
    }
  },
  mutations: {
    notifyRequest (state) {
      state.requestsInProgress++
    },
    notifyResponse (state) {
      state.requestsInProgress = Math.max(state.requestsInProgress - 1, 0)
    },
    reset: (state) => {
      state.requestsInProgress = 0
    }
  },
  getters: {
    isLoadingInProgress: (state) => {
      return state.requestsInProgress > 0
    }
  }
}
