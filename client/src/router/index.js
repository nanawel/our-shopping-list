import Vue from 'vue'
import VueRouter from 'vue-router'
import VUE_APP_SINGLEBOARD_MODE from '@/config'

// Components
const Home = () => import('@/components/Home.vue')
const About = () => import('@/components/About.vue')

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    components: {
      root: Home
    },
    beforeEnter: (to, from, next) => {
      if (VUE_APP_SINGLEBOARD_MODE) {
        // Skip screen and force redirect to the board
        next({name: 'board', params: {boardSlug: '_'}})
      } else {
        next()
      }
    }
  },
  {
    path: '/about',
    name: 'about',
    components: {
      root: About,
    }
  },
]

const router = new VueRouter({
  routes
})

import boardRoutes from './board'
boardRoutes(router)

export default router
