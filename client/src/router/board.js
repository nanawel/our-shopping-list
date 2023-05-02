import store from '@/store'
import logger from '@/service/logger'
import {sock} from '@/service/socket-io'

const BoardComponent = () => import('@/components/BoardComponent.vue')
const BoardHomeComponent = () => import('@/components/Board/HomeComponent.vue')
const ListComponent = () => import('@/components/ListComponent.vue')
const NavDefaultComponent = () => import('@/components/Nav/DefaultComponent.vue')
const NavListComponent = () => import('@/components/List/NavComponent.vue')

import BoardModel from '@/models/Board'
import ListModel from '@/models/List'

export default (router) => {
  [
    {
      path: '/board',
      name: 'currentBoard',
      beforeEnter: (to, from, next) => {
        if (store.state.board && store.state.board.currentBoard) {
          next({
            name: 'board',
            params: {
              boardSlug: store.state.board.currentBoard.slug
            }
          })
        } else {
          next()
        }
      },
      components: {
        boardNavigation: NavDefaultComponent,
        boardContent: BoardHomeComponent
      }
    },
    {
      path: '/list',
      redirect: {name: 'board'}
    },
    {
      path: '/list/:listId',
      redirect: (to) => {
        if (store.state.board && store.state.board.currentBoard) {
          return {
            name: 'list',
            params: {
              boardSlug: store.state.board.currentBoard.slug,
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
        root: BoardComponent,
      },
      children: [
        {
          path: '',
          name: 'board',
          components: {
            boardNavigation: NavDefaultComponent,
            boardContent: BoardHomeComponent
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
            boardNavigation: NavListComponent,
            boardContent: ListComponent
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
      } else {
        BoardModel.api()
          .get(`/boards/by-slug/${to.params.boardSlug}`)
          .then((response) => {
            // We cannot pass response.entities.boards[0] directly as it does not contain the linked lists
            // so we let the board store module do the loading with the ID
            store.commit('board/setCurrentBoard', {id: response.entities.boards[0]._id})
          })
          .catch((e) => {
            logger.error(e)
            router.app.$snackbar.msg('Could not load board :(')
          })
      }
    } else {
      const lastBoardId = store.state.board?.currentBoardId || store.state.board?.lastBoardId
      if (lastBoardId) {
        store.commit('board/setCurrentBoard', {null: true})
        sock.emit('leave-board', lastBoardId)
      }
    }

    /**
     * List ID handler
     */
    if (to.params.listId) {
      if (to.params.listId === 'new') {
        store.commit('list/setCurrentList', new ListModel())
        logger.log(store.state.list.currentList);
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
              // We cannot pass response.entities.lists[0] directly as it does not contain the linked items
              // so we let the list store module do the loading with the ID
              store.commit('list/setCurrentList', {id: response.entities.lists[0]._id})
            })
            .catch((e) => {
              if (e.response && e.response.status === 404) {
                // List seems to be invalid, so remove it from local repository
                ListModel.delete(to.params.listId)
                router.app.$snackbar.msg('List not found!')
              } else {
                logger.error(e)
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
