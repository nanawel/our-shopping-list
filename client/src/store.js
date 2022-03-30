import Vue from 'vue'
import Vuex from 'vuex'
import { VuexPersistence } from 'vuex-persist'
Vue.use(Vuex)

// ORM/Axios
import VuexORM from '@vuex-orm/core'
import VuexORMAxios from '@vuex-orm/plugin-axios'
import axios from 'axios'
VuexORM.use(VuexORMAxios, { axios })

// Event Bus
import eventBus from '@/service/event-bus'

// Modules
import version from '@/store/version'
import snackbar from '@/store/snackbar'
import board from '@/store/board'
import list from '@/store/list'
import loadingProgress from '@/store/loadingProgress'

// Models registration
import Board from '@/models/Board'
import List from '@/models/List'
import Item from '@/models/Item'

const database = new VuexORM.Database()
database.register(Board)
database.register(List)
database.register(Item)

const vuexPersistence = new VuexPersistence({
  key: process.env.LOCALSTORAGE_KEY || 'OurShoppingList',
  storage: window.localStorage,
  reducer: (state) => {
    let persistedState = Object.assign({}, state)
    persistedState.board = {
      currentBoardId: board.currentBoardId,
      lastBoardId: board.lastBoardId
    }
    persistedState.list = {
      currentListId: list.currentListId,
      lastListId: list.lastListId
    }
    return persistedState
  }
})

// Create Vuex Store and register database through Vuex ORM
const store = new Vuex.Store({
  //strict: true,
  modules: {
    version,
    snackbar,
    board: board.module(),
    list: list.module(),
    loadingProgress
  },
  plugins: [
    VuexORM.install(database),
    vuexPersistence.plugin
  ],
})

// Assign current board to each newly created list
eventBus.$on('repository_save::before', function (model) {
  if (model instanceof List
    && store.state.board.currentBoardId
  ) {
    model.boardId = store.state.board.currentBoardId
  }
})

// Trigger init for the "loadingProgress" module here
store.dispatch('loadingProgress/init')

export default store
