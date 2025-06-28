import {createRouter, createWebHashHistory, useRoute} from 'vue-router'
import {i18n} from '@/service/i18n'
import {setPageTitle} from '@/service/page-title'
import {isSingleBoardMode} from '@/service/board-mode'
import config from '@/config'

// Components
const HomeComponent = () => import('@/components/HomeComponent.vue')
const AboutComponent = () => import('@/components/AboutComponent.vue')
const DebugComponent = () => import('@/components/DebugComponent.vue')

const routes = [
  {
    path: '/',
    name: 'home',
    components: {
      root: HomeComponent
    },
    beforeEnter: (to, from, next) => {
      if (isSingleBoardMode()) {
        // Skip screen and force redirect to the board
        next({name: 'board', params: {boardSlug: config.VITE_APP_SINGLEBOARD_SLUG}})
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
    },
    beforeEnter: (to, from, next) => {
      next()
    }
  },
  {
    path: '/debug',
    name: 'debug',
    components: {
      root: DebugComponent,
    },
    beforeEnter: (to, from, next) => {
      next()
    }
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// Doesn't work for some reason. Need to investigate.
router.afterEach((to) => {
  switch (to.name) {
    case 'home':
      setPageTitle(i18n.global.t('home.page-title'))
      break
    case 'about':
      setPageTitle(i18n.global.t('about.page-title'))
      break
  }
})

const routerPlugin = {
  install(app) {
    app.use(router)
  }
}

import boardRoutes from './board'
boardRoutes(router)

export {
  routerPlugin,
  router,
  useRoute
}
