// Vue
import Vue from 'vue'
import App from '@/App.vue'

Vue.config.productionTip = false

// Vuetify
import vuetify from '@/plugins/vuetify'

// Vuex / Vuex ORM / Init store
import store from '@/store'

// Vue Touch Events
import Vue2TouchEvents from 'vue2-touch-events'
Vue.use(Vue2TouchEvents)

// Vue Virtual Scroller
import VueVirtualScroller from 'vue-virtual-scroller'
Vue.use(VueVirtualScroller)

// Snackbar
import snackbarPlugin from '@/plugins/snackbar'
Vue.use(snackbarPlugin, { store })

// Repository
import repositoryPlugin from '@/plugins/repository'
Vue.use(repositoryPlugin, { store })

// ORM Socket Service
import wsService from '@/service/ws'
import { io } from 'socket.io-client'
const sock = io()
Vue.use(wsService, { sock, store })

// Vue Router
import router from '@/router'

// Init app
const $app = new Vue({
  el: '#app',
  render: h => h(App),
  vuetify,
  store,
  router,
  data: {
    title: null,
    isOnline: null,
    isReloading: false
  },
  computed: {
    isMultiBoardMode: function () {
      return !!parseInt(process.env.MULTIBOARD_MODE)
    }
  },
  watch: {
    title: function(v) {
      document.title = v
    }
  },
  methods: {
    setTitle: function(title) {
      this.title = title || 'Our Shopping List'
    },
    updateConnectionStatus: function() {
      this.isOnline = navigator.onLine
    },
    forceRefresh: function() {
      document.location.reload()
    }
  },
  mounted() {
    this.setTitle()
    window.addEventListener('online', this.updateConnectionStatus)
    window.addEventListener('offline', this.updateConnectionStatus)
    this.updateConnectionStatus()

    /*// Redirect to the list present in localStorage if any
    if (this.$store.state.list.currentList) {
      const currentListPath = `/list/${this.$store.state.list.currentList._id}`
      if (this.$router.currentRoute.path != currentListPath) {
        this.$router.push(currentListPath)
      }
    }*/
  }
})
store.$app = $app
