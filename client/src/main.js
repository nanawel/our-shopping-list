// Vue
import {createApp} from 'vue'
import App from '@/App.vue'
const app = createApp(App)

// Logger
import {loggerPlugin} from '@/service/logger'
app.use(loggerPlugin)

// APM
import {apmPlugin} from '@/service/apm'
app.use(apmPlugin)

// PWA
import '@/registerServiceWorker'

// App config
import config from '@/config'

// Vue i18n
import {i18nPlugin} from '@/service/i18n'
app.use(i18nPlugin)

// Vuetify
import vuetify from '@/service/vuetify'
app.use(vuetify)

// Vuex / Vuex ORM / Init store
import {storePlugin} from '@/service/store'
app.use(storePlugin)

// Vue Touch Events
import VueTouchEvents from 'vue3-touch-events'
app.use(VueTouchEvents, {
  touchHoldTolerance: 300
})

// Snackbar
import {snackbarPlugin} from '@/service/snackbar'
app.use(snackbarPlugin)

// Repository
import {repositoryPlugin} from '@/service/repository'
app.use(repositoryPlugin)

// ORM Socket Service
import wsService from '@/service/ws'
app.use(wsService)

// Vue Router
import {routerPlugin} from '@/router'
app.use(routerPlugin)

// Observers
import boardObserver from '@/observer/board'
app.use(boardObserver)
import listObserver from '@/observer/list'
app.use(listObserver)
import restoreStateObserver from '@/observer/restorestate'
app.use(restoreStateObserver)
import showForceRefreshHint from '@/observer/showForceRefreshHint'
app.use(showForceRefreshHint)

// Custom web root support (#58/GITHUB#18)
// Redirect to base path if needed
if (!window.location.pathname.startsWith(config.BASE_URL)) {
  window.location.pathname = config.BASE_URL
}

// Mount app
app.mount('#app')

if (config.VUE_APP_DISABLE_CONTEXTMENU) {
  // Prevent context menu from popping when using Chrome DevTools with touch-hold event
  window.addEventListener('contextmenu', function(ev) {
    ev.preventDefault()
  }, true)
}
