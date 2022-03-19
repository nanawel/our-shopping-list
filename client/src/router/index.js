import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'

// Components
// Using closures instead of "import ... from ..." to speed up initial loading
const Home = () => import('@/components/Home.vue')
const Board = () => import('@/components/Board.vue')
//const BoardHome = () => import('@/components/Board/Home.vue')
const NavDefault = () => import('@/components/Nav/Default.vue')
const List = () => import('@/components/List.vue')
const NavList = () => import('@/components/List/Nav.vue')
const About = () => import('@/components/About.vue')

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    components: {
      root: Home,
      navigation: NavDefault
    }
  },
  {
    path: '/list',
    beforeEnter: (to, from) => {
      console.log(store, to, from)
    },
  },
  {
    path: '/list/:listId',
    beforeEnter: (to, from) => {
      console.log(store, to, from)
    },
  },
  {
    path: '/board/:boardSlug',
    components: {
      root: Board,
      navigation: NavList,
      boardContent: List
    }
  },
  {
    path: '/board/:boardSlug/list',
    components: {
      root: Board,
      navigation: NavList,
      boardContent: List
    }
  },
  {
    path: '/board/:boardSlug/list/:listId',
    components: {
      root: Board,
      navigation: NavList,
      boardContent: List
    }
  },
  {
    path: '/about',
    components: {
      root: Board,
      navigation: NavDefault,
      boardContent: About
    }
  },
]

const router = new VueRouter({
  routes
})

export default router
