import {Query} from "@vuex-orm/core";

import { DISPLAY_MODE_UNCHECKED_ONLY } from '@/constants'
import List from "@/models/List"
import store from "@/store";

const loadList = function ({state}, listId) {
  if (listId === 'new') {
    state.currentList = new List()
  } else {
    List.api()
      .get(`/lists/${listId}`)
      .then(() => {
        state.currentList = List.query()
          .with("items")
          .find(listId)
      })
      .catch((e) => {
        console.error(e)
        if (e.response && e.response.status === 404) {
          // List seems to be invalid, so remove it from local repository
          List.delete(listId)
          throw "List not found!"
        } else {
          throw "Could not load list :("
        }
      })
  }
}

Query.on('afterDelete', function (model) {
  if (model instanceof List
    && store.state.list.currentList._id === model._id
  ) {
    store.commit('list/setCurrentList', null)
  }
})

export default {
  namespaced: true,
  state: () => ({
    currentList: null,
    displayMode: DISPLAY_MODE_UNCHECKED_ONLY
  }),
  actions: {
    syncCurrentList (context) {
      if (context.state.currentList && context.state.currentList._id) {
        loadList(context, context.state.currentList._id)
      }
    }
  },
  mutations: {
    setCurrentList (state, payload) {
      console.log('list/setCurrentList', payload)
      if (payload === null) {
        state.currentList = null
      }
      else if (payload.list instanceof List) {
        state.currentList = payload.list
      }
      else if (payload.id) {
        if (!state.currentList || state.currentList._id !== payload.id) {
          loadList({state}, payload.id)
        }
      }
      else {
        throw "Invalid argument for setCurrentList()!"
      }
    },
    setDisplayMode (state, payload) {
      state.displayMode = payload.mode
    }
  }
}
