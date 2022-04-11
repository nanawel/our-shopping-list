import eventBus from "@/service/event-bus"
import Board from '@/models/Board'

/**
 * @param {Object}
 * @returns {Board|undefined}
 */
const loadBoard = function ({id, slug}) {
  if (id) {
    return Board.query()
      .with('lists')
      .find(id)
  } else if (slug) {
    return Board.query()
      .with('lists')
      .where('slug', slug)
      .first()
  } else {
    throw 'Invalid board for loading: ' + JSON.stringify(arguments[0])
  }
}

export default {
  module() {
    return {
      namespaced: true,
      state: () => ({
        currentBoard: null,     // *Not* persisted
        currentBoardId: null,
        lastBoard: null,        // *Not* persisted
        lastBoardId: null,
      }),
      mutations: {
        setCurrentBoard (state, payload) {
          if (payload instanceof Board) {
            payload = {board: payload}
          }
          const doSet = (board) => {
            const newBoardId = board ? board._id : null
            const previousBoard = state.currentBoard
            if (board !== null) {
              state.lastBoard = board
              state.lastBoardId = board ? newBoardId : null
            }
            // Here we can use this condition because a Board *always has an ID on the client side*
            // => The board is necessarily created on the server
            if (state.currentBoardId !== newBoardId) {
              state.currentBoard = board
              state.currentBoardId = newBoardId

              eventBus.$emit('board_set::after', board, previousBoard)
            }
          }

          if (payload.board instanceof Board
            && payload.board !== state.currentBoard
          ) {
            doSet(payload.board)
          }
          else if (payload.slug) {
            if (!state.currentBoard
              || state.currentBoard.slug !== payload.slug
            ) {
              doSet(loadBoard(payload))
            }
          }
          else {
            throw "Invalid argument for setCurrentBoard()!"
          }
        },
        reset(state) {
          console.log('board/reset')
          state.currentBoard = null
          state.currentBoardId = null
          state.lastBoard = null
          state.lastBoardId = null
        }
      },
      actions: {
        reset({commit}) {
          commit('reset')
        }
      }
    }
  }
}
