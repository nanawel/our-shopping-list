import {Query} from "@vuex-orm/core";
import store from '@/store'

import Board from '@/models/Board'
import List from '@/models/List'

Query.on('beforeCreate', function (model) {
  if (model instanceof List
    && store.state.board.currentBoard._id
  ) {
    // Set current board as list's owner
    model.boardId = store.state.board.currentBoard._id
  }
})

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
        if (!state.currentBoard
          || state.currentBoard.slug !== payload.slug
        ) {
          Board.api()
            .get(`/boards/by-slug/${payload.slug}`)
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
