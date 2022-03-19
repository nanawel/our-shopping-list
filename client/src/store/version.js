export default {
  namespaced: true,
  state: () => ({
    version: null,
    buildId: null,
    configHash: null
  }),
  mutations: {
    setCurrentVersion (state, payload) {
      state.version = payload.version
      state.buildId = payload.buildId
      state.configHash = payload.configHash
    },
  }
}
