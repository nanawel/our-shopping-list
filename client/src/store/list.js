import { DISPLAY_MODE_UNCHECKED_ONLY } from '@/constants'

export default {
  namespaced: true,
  state: () => ({
    currentList: null,
    displayMode: DISPLAY_MODE_UNCHECKED_ONLY
  }),
  mutations: {
    setCurrentList (state, payload) {
      state.currentList = payload.list
    },
    setDisplayMode (state, payload) {
      state.displayMode = payload.mode
    }
  }
}
