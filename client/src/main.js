// Vue
import Vue from 'vue'
import App from '@/App.vue'

Vue.config.productionTip = false

// App config
import config from '@/config'

// Vue i18n
import i18n from '@/i18n'

// Vuetify
import vuetify from '@/plugins/vuetify'

// Vuex / Vuex ORM / Init store
import store from '@/store'

// Vue Touch Events
import Vue2TouchEvents from 'vue2-touch-events'
Vue.use(Vue2TouchEvents, {
  // Need to override the default namespace "touch" because "v-touch:*" is already used by Vuetify
  // See https://vuetifyjs.com/en/directives/touch/
  namespace: 'touch-event'
})

// Vue Virtual Scroller
import VueVirtualScroller from 'vue-virtual-scroller'
Vue.use(VueVirtualScroller)

// Snackbar
import snackbarPlugin from '@/plugins/snackbar'
Vue.use(snackbarPlugin, {store})

// Repository
import repositoryPlugin from '@/plugins/repository'
Vue.use(repositoryPlugin, {store})

// ORM Socket Service
import wsService from '@/service/ws'
Vue.use(wsService, {store})

// Vue Router
import router from '@/router'

// Observers
import boardObserver from '@/observer/board'
Vue.use(boardObserver)
import listObserver from '@/observer/list'
Vue.use(listObserver)

// Init app
const $app = new Vue({
  el: '#app',
  render: h => h(App),
  i18n,
  vuetify,
  store,
  router,
  data: {
    title: null,
    isOnline: null,
    isReloading: false
  },
  computed: {
    isSingleBoardMode: function () {
      return config.VUE_APP_SINGLEBOARD_MODE
    }
  },
  watch: {
    title: function(v) {
      document.title = v
    }
  },
  methods: {
    setTitle: function(title) {
      this.title = title || process.env.APP_TITLE || 'Our Shopping List'
    },
    updateConnectionStatus: function() {
      this.isOnline = navigator.onLine
    },
    forceRefresh: function() {
      this.isReloading = true
      this.$store.replaceState({})
      window.localStorage.clear()
      window.location.reload()
    }
  },
  mounted() {
    this.setTitle()
    window.addEventListener('online', this.updateConnectionStatus)
    window.addEventListener('offline', this.updateConnectionStatus)
    this.updateConnectionStatus()
  }
})
store.$app = $app

// DEV ONLY
if (typeof window.webpackHotUpdate !== 'undefined') {
  // Prevent context menu from popping when using Chrome DevTools
  window.addEventListener('contextmenu', function(e) {
    e.preventDefault()
  }, true)
}
