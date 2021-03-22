export default {
  namespaced: true,
  state: () => ({
    currentVersion: null,
    currentBuildId: null
  }),
  mutations: {
    setCurrentVersion (state, payload) {
      state.currentVersion = payload.version
      state.currentBuildId = payload.buildId
    },
  }
}
