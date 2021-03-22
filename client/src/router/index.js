import Vue from 'vue'
import VueRouter from 'vue-router'

// Components
import Home from '../components/Home.vue'
import NavDefault from '../components/Nav/Default.vue'
import List from '../components/List.vue'
import NavList from '../components/List/Nav.vue'
import About from '../components/About.vue'

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
