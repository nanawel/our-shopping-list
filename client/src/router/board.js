// import Vue from 'vue'
// import VueRouter from 'vue-router'
import store from '@/store'

const Board = () => import('@/components/Board.vue')
const BoardHome = () => import('@/components/Board/Home.vue')
const List = () => import('@/components/List.vue')
const NavList = () => import('@/components/List/Nav.vue')

const routes = [
  {
    path: '/board',
    name: 'currentBoard',
    beforeEnter: (to, from, next) => {
      if (store.state.board.currentBoard) {
        return { name: 'board', boardSlug: store.state.board.currentBoard.slug }
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
    beforeEnter: (to, from, next) => {
      store.commit('board/setCurrentBoard', { slug: to.params.boardSlug })
      next()
    },
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
        path: 'list/:listId',
        name: 'boardList',
        beforeEnter: (to, from, next) => {
          store.commit('list/setCurrentList', { id: to.params.listId })
          next()
        },
        components: {
          boardNavigation: NavList,
          boardContent: List
        }
      }
    ]
  },
]

export default routes
