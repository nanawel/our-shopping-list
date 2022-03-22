import store from '@/store'

const Board = () => import('@/components/Board.vue')
const BoardHome = () => import('@/components/Board/Home.vue')
const List = () => import('@/components/List.vue')
const NavList = () => import('@/components/List/Nav.vue')

export default (router) => {
  [
    {
      path: '/board',
      name: 'currentBoard',
      beforeEnter: (to, from, next) => {
        if (store.state.board.currentBoard) {
          return {name: 'board', boardSlug: store.state.board.currentBoard.slug}
        }
        next()
      },
      components: {
        boardNavigation: NavList,
        boardContent: BoardHome
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
            boardNavigation: NavList,
            boardContent: BoardHome
          }
        },
        {
          path: 'list',
          name: 'newList',
          beforeEnter: (to, from, next) => {
            next({name: 'list', params: {listId: 'new'}})
          }
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

  router.beforeResolve((to, from, next) => {
    if (to.params.boardSlug) {
      store.commit('board/setCurrentBoard', {slug: to.params.boardSlug})
    }
    if (to.params.listId) {
      store.commit('list/setCurrentList', {id: to.params.listId})
    }
    next()
  })
}
