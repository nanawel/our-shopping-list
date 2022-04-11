import store from '@/store'
import {sock} from '@/service/socket-io'

const Board = () => import('@/components/Board.vue')
const BoardHome = () => import('@/components/Board/Home.vue')
const List = () => import('@/components/List.vue')
const NavDefault = () => import('@/components/Nav/Default.vue')
const NavList = () => import('@/components/List/Nav.vue')

import BoardModel from '@/models/Board'
import ListModel from '@/models/List'

export default (router) => {
  [
    {
      path: '/board',
      name: 'currentBoard',
      beforeEnter: (to, from, next) => {
        if (store.getters['board/currentBoard']) {
          return {name: 'board', params: {boardSlug: store.getters['board/currentBoard'].slug}}
        }
        next()
      },
      components: {
        boardNavigation: NavDefault,
        boardContent: BoardHome
      }
    },
    {
      path: '/list',
      redirect: {name: 'board'}
    },
    {
      path: '/list/:listId',
      redirect: (to) => {
        if (store.getters['board/currentBoard']) {
          return {
            name: 'list', params: {
              boardSlug: store.getters['board/currentBoard'].slug,
              listId: to.params.listId
            }
          }
        }
        return {name: 'home'}
      }
    },
    {
      path: '/board/:boardSlug',
      components: {
        root: Board,
      },
      children: [
        {
          path: '',
          name: 'board',
          components: {
            boardNavigation: NavDefault,
            boardContent: BoardHome
          }
        },
        {
          path: 'list',
          name: 'newList',
          beforeEnter: (to, from, next) => {
            next({name: 'list', params: {listId: 'new'}})
          },
        },
        {
          path: 'list/:listId',
          name: 'list',
          components: {
            boardNavigation: NavList,
            boardContent: List
          }
        }
      ]
    },
  ].forEach((r) => router.addRoute(r))

  /**
   * Global Guards
   */
  router.beforeResolve((to, from, next) => {
    /**
     * Board slug handler
     */
    if (to.params.boardSlug) {
      const board = BoardModel.query()
        .with('lists')
        .where('slug', to.params.boardSlug)
        .first()

      if (board) {
        store.commit('board/setCurrentBoard', board)

        if (board._id) {
          sock.emit('join-board', board._id)
        }
      } else {
        BoardModel.api()
          .get(`/boards/by-slug/${to.params.boardSlug}`)
          .then((response) => {
            store.commit('board/setCurrentBoard', response.entities.boards[0])
          })
          .catch((e) => {
            console.error(e)
            router.app.$snackbar.msg('Could not load board :(')
          })
      }
    } else {
      const lastBoardId = store.state.board.currentBoardId || store.state.board.lastBoardId
      if (lastBoardId) {
        sock.emit('leave-board', lastBoardId)
      }
    }

    /**
     * List ID handler
     */
    if (to.params.listId) {
      if (to.params.listId === 'new') {
        store.commit('list/setCurrentList', new ListModel())
      } else {
        const list = ListModel.query()
          .with('items')
          .find(to.params.listId)

        if (list) {
          store.commit('list/setCurrentList', list)
        } else {
          ListModel.api()
            .get(`/lists/${to.params.listId}`)
            .then((response) => {
              store.commit('list/setCurrentList', response.entities.lists[0])
            })
            .catch((e) => {
              if (e.response && e.response.status === 404) {
                // List seems to be invalid, so remove it from local repository
                ListModel.delete(to.params.listId)
                router.app.$snackbar.msg('List not found!')
              } else {
                console.error(e)
                router.app.$snackbar.msg('Could not load list :(')
              }
            })
        }
      }
    } else {
      // Clear current list if not used on current route
      store.commit('list/setCurrentList', {null: true})
    }

    next()
  })
}
