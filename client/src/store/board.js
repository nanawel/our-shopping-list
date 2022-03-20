import Board from '@/models/Board';

export default {
  namespaced: true,
  state: () => ({
    currentBoard: null,
  }),
  mutations: {
    setCurrentBoard (state, payload) {
      if (payload.board instanceof Board) {
        state.currentBoard = payload.board
      }
      else if (payload.slug) {
        if (!state.currentBoard || state.currentBoard.slug !== payload.slug) {
          Board.api()
            .get(`/boards/${payload.slug}`)
            .then(() => {
              state.currentBoard = Board.query()
                .with("lists")
                .where('slug', payload.slug)
                .first()
            })
            .catch((e) => {
              console.error(e)
              state.currentBoard = null
            })
        }
      }
      else {
        throw "Invalid argument for setCurrentBoard()!"
      }
    }
  }
}
