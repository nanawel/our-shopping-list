import {Query} from "@vuex-orm/core";

import { DISPLAY_MODE_UNCHECKED_ONLY } from '@/constants'
import List from "@/models/List"
import store from "@/store";

/**
 * @param {String} listId
 * @returns {List|undefined}
 */
const loadList = function (listId) {
  return List.query()
    .with("items")
    .find(listId)
}

Query.on('afterDelete', function (model) {
  if (model instanceof List
    && store.state.list.currentList._id === model._id
  ) {
    store.commit('list/setCurrentList', {'null': true})
  }
})

export default {
  module() {
    return {
      namespaced: true,
      state: () => ({
        flag: 1,
        currentList: null,      // *Not* persisted
        currentListId: null,
        lastList: null,         // *Not* persisted
        lastListId: null,
        displayMode: DISPLAY_MODE_UNCHECKED_ONLY
      }),
      mutations: {
        setCurrentList (state, payload) {
          if (payload instanceof List) {
            payload = {list: payload}
          }
          const doSet = (list) => {
            if (list) {
              if (!(list instanceof List)) {
                throw new Error('Invalid list! ' + JSON.stringify(list))
              }
              state.lastList = list
              state.lastListId = list ? list._id : null
            }
            state.currentList = list
            state.currentListId = list ? list._id : null
            state.flag += 1
          }

          if (payload.null === true) {
            doSet(null)
          }
          else if (payload.list instanceof List
            && payload.list !== state.currentList
          ) {
            doSet(payload.list)
          }
          else if (payload.id) {
            if (!state.currentList
              || state.currentList._id !== payload.id
            ) {
              doSet(loadList(payload.id))
            }
          }
          else {
            throw "Invalid argument for setCurrentList()!"
          }
        },
        setDisplayMode (state, payload) {
          state.displayMode = payload.mode
        }
      },
    }
  }
}
