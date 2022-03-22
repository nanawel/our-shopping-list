import {Query} from "@vuex-orm/core";

import { DISPLAY_MODE_UNCHECKED_ONLY } from '@/constants'
import List from "@/models/List"
import store from "@/store";

/**
 *
 * @param {String} listId
 * @returns {Promise}
 */
const loadList = function (listId) {
  if (listId === 'new') {
    return new Promise((resolve) => {
      resolve(new List())
    })
  } else {
    return new Promise((resolve, reject) => {
      List.api()
        .get(`/lists/${listId}`)
        .then(() => {
          resolve(List.query()
            .with("items")
            .find(listId))
        })
        .catch(reject)
    })
  }
}

Query.on('afterDelete', function (model) {
  if (model instanceof List
    && store.state.list.currentList._id === model._id
  ) {
    store.commit('list/setCurrentList', {'null': true})
  }
})

export default {
  namespaced: true,
  state: () => ({
    currentList: null,
    lastList: null,
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

      const doSet = (list) => {
        if (list) {
          if (!(list instanceof List)) {
            throw new Error('Invalid list! ' + JSON.stringify(list))
          }
          state.lastList = list
        }
        state.currentList = list
      }

      if (payload.null === true) {
        doSet(null)
      }
      else if (payload.list instanceof List) {
        doSet(payload.list)
      }
      else if (payload.id) {
        if (!state.currentList || state.currentList._id !== payload.id) {
          loadList({state}, payload.id)
            .then((list) => doSet(list))
            .catch((e) => {
              console.error(e)
              if (e.response && e.response.status === 404) {
                // List seems to be invalid, so remove it from local repository
                List.delete(payload.id)
                throw "List not found!"
              } else {
                throw "Could not load list :("
              }
            })
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
