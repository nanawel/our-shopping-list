import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

// ORM/Axios
import VuexORM from '@vuex-orm/core'
import VuexORMAxios from '@vuex-orm/plugin-axios'
import axios from 'axios'
VuexORM.use(VuexORMAxios, { axios })


// Modules
import version from '@/store/version'
import snackbar from '@/store/snackbar'
import list from '@/store/list'
import loadingProgress from '@/store/loadingProgress'

// Models registration
import List from '@/models/List'
import Item from '@/models/Item'

const database = new VuexORM.Database()
database.register(List)
database.register(Item)

// Local Storage Plugin
import localStoragePlugin from '@/store/plugins/localStorage'

// Create Vuex Store and register database through Vuex ORM
const store = new Vuex.Store({
  modules: {
    version,
    snackbar,
    list,
    loadingProgress
  },
  plugins: [
    VuexORM.install(database),
    localStoragePlugin
  ],
})

// Custom init for this module here
store.dispatch('loadingProgress/init')

export default store
