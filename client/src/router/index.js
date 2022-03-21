import Vue from 'vue'
import VueRouter from 'vue-router'

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
