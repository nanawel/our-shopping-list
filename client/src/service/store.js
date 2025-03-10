import config from '@/config'
import path from 'path-browserify'

import {createStore} from 'vuex'

// ORM/Axios
import VuexORM, {Query} from '@vuex-orm/core'
import VuexORMAxios from '@vuex-orm/plugin-axios'
import Axios from 'axios'

// Modules
import version from '@/store/version'
import snackbar from '@/store/snackbar'
import dialog from '@/store/dialog'
import board from '@/store/board'
import list from '@/store/list'
import modelSync from '@/store/modelSync'
import loadingProgress from '@/store/loadingProgress'

// Models registration
import Board from '@/models/Board'
import List from '@/models/List'
import Item from '@/models/Item'

const axios = Axios.create({
  baseURL: path.normalize(`/${config.BASE_URL}`)  // Custom web root support (#58/GITHUB#18)
})
VuexORM.use(VuexORMAxios, {
  axios: axios,   // Must use this syntax otherwise validateStatus() won't work (on 404 for instance)
})

const database = new VuexORM.Database()
database.register(Board)
database.register(List)
database.register(Item)

// Create Vuex Store and register database through Vuex ORM
let store = createStore({
    //strict: true,
    modules: {
      version,
      snackbar,
      dialog,
      board: board.module(),
      list: list.module(),
      loadingProgress: loadingProgress.module(axios),
      modelSync: modelSync.module()
    },
    plugins: [
      VuexORM.install(database)
    ],
  })

// Unset board from store on deletion
Query.on('afterDelete', function (model) {
  if (model instanceof Board
    && model._id === store.state.board.currentBoardId
  ) {
    store.dispatch('list/reset')
    if (model._id === store.state.board.lastBoardId) {
      store.dispatch('board/reset')
    } else {
      store.commit('board/setCurrentBoard', null)
    }
  }
})

// Unset list from store on deletion
Query.on('afterDelete', function (model) {
  if (model instanceof List
    && model._id === store.state.list.currentListId
  ) {
    store.dispatch('list/reset')
  }
})

// Trigger init for the "loadingProgress" module here
store.dispatch('loadingProgress/init')
const storePlugin = {
  install(app) {
    app.use(store)
  }
}

export {
  storePlugin,
  store
}
