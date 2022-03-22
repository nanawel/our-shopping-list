import {Query} from "@vuex-orm/core";
import store from '@/store'

import Board from '@/models/Board'
import List from '@/models/List'

Query.on('beforeCreate', function (model) {
  if (model instanceof List
    && store.state.board.currentBoard
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
    lastBoard: null,
  }),
  mutations: {
    setCurrentBoard (state, payload) {
      console.log('board/setCurrentBoard', payload)

      const doSet = (board) => {
        console.log('board/setCurrentBoard/doSet', board)
        if (board !== null) {
          state.lastBoard = board
        }
        state.currentBoard = board
      }

      if (payload.board instanceof Board) {
        doSet(payload.board)
      }
      else if (payload.slug) {
        if (!state.currentBoard
          || state.currentBoard.slug !== payload.slug
        ) {
          Board.api()
            .get(`/boards/by-slug/${payload.slug}`)
            .then(() => {
              doSet(Board.query()
                .with("lists")
                .where('slug', payload.slug)
                .first())
            })
            .catch((e) => {
              console.error(e)
              doSet(null)
            })
        }
      }
      else {
        throw "Invalid argument for setCurrentBoard()!"
      }
    },
    reset(state) {
      console.log('board/reset')

      state.currentBoard = null
      state.lastBoard = null
    }
  },
  actions: {
    reset({commit}) {
      commit('reset')
    }
  }
}
