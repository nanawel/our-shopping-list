export default {
  module(axios) {
    return {
      namespaced: true,
      state: () => ({
        requestsInProgress: 0,
      }),
      actions: {
        init(context) {
          context.commit('reset')

          // 1. Observe AXIOS requests
          // See https://axios-http.com/docs/interceptors
          axios.interceptors.request.use(function (request) {
            context.commit('notifyRequest')
            return request
          })

          const onComplete = function (response) {
            context.commit('notifyResponse')
            return response
          }
          axios.interceptors.response.use(onComplete, onComplete)

          // 2. Observe FETCH requests
          // FIXME Not exactly a clean method, try and find a better one
          const nativeFetch = window.fetch
          window.fetch = function(...args) {
            context.commit('notifyRequest')
            return nativeFetch.apply(window, args)
              .finally(() => {
                context.commit('notifyResponse')
              })
          }
        }
      },
      mutations: {
        notifyRequest(state) {
          state.requestsInProgress++
        },
        notifyResponse(state) {
          state.requestsInProgress = Math.max(state.requestsInProgress - 1, 0)
        },
        reset: (state) => {
          state.requestsInProgress = 0
        }
      },
      getters: {
        isLoadingInProgress: (state) => {
          return !state || state.requestsInProgress > 0
        }
      }
    }
  }
}
