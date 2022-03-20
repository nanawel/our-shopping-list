import Vue from 'vue'
import VueRouter from 'vue-router'

// Components
const Home = () => import('@/components/Home.vue')
const About = () => import('@/components/About.vue')

Vue.use(VueRouter)

import boardRoutes from './board'

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
].concat(boardRoutes)

const router = new VueRouter({
  routes
})

export default router
