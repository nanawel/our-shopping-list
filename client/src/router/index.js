import Vue from 'vue'
import VueRouter from 'vue-router'
import config from '@/config'

// Components
const HomeComponent = () => import('@/components/HomeComponent.vue')
const AboutComponent = () => import('@/components/AboutComponent.vue')

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    components: {
      root: HomeComponent
    },
    beforeEnter: (to, from, next) => {
      if (config.VUE_APP_SINGLEBOARD_MODE) {
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
      root: AboutComponent,
    }
  },
]

const router = new VueRouter({
  routes
})

import boardRoutes from './board'
boardRoutes(router)

export default router
