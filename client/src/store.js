import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

import VuexORM from '@vuex-orm/core'
import VuexORMAxios from '@vuex-orm/plugin-axios'
import axios from 'axios'
VuexORM.use(VuexORMAxios, { axios })

import version from './store/version'
import snackbar from './store/snackbar'
import list from './store/list'

const database = new VuexORM.Database()

import List from '@/models/List'
import Item from '@/models/Item'

database.register(List)
database.register(Item)

// Local Storage Plugin
import localStoragePlugin from './store/plugins/localStorage'

// Create Vuex Store and register database through Vuex ORM
const store = new Vuex.Store({
  modules: {
    version,
    snackbar,
    list
  },
  plugins: [
    VuexORM.install(database),
    localStoragePlugin
  ],
})

export default store
