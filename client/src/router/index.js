import Vue from 'vue'
import VueRouter from 'vue-router'

// Components
// Using closures instead of "import ... from ..." to speed up initial loading
const Home = () => import('../components/Home.vue')
const NavDefault = () => import('../components/Nav/Default.vue')
const List = () => import('../components/List.vue')
const NavList = () => import('../components/List/Nav.vue')
const About = () => import('../components/About.vue')

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    components: {
      navigation: NavDefault,
      default: Home
    }
  },
  {
    path: '/list',
    components: {
      navigation: NavList,
      default: List
    }
  },
  {
    path: '/list/:listId',
    components: {
      navigation: NavList,
      default: List
    }
  },
  {
    path: '/about',
    components: {
      navigation: NavDefault,
      default: About
    }
  },
]

const router = new VueRouter({
  routes
})

export default router
