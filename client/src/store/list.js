import {Query} from '@vuex-orm/core'

import {DISPLAY_MODE_UNCHECKED_ONLY} from '@/constants'
import List from '@/models/List'
import {logger} from '@/service/logger'
import eventBus from '@/service/event-bus'
import {store} from '@/service/store'

/**
 * @param {String} listId
 * @returns {List|undefined}
 */
const loadList = function (listId) {
  return List.query()
    .with('items')
    .find(listId)
}

Query.on('afterUpdate', function (model) {
  if (model
    && model instanceof List
    && store.state.list?.currentList?._id === model._id
  ) {
    // Force propagating changes on the model wherever it's used
    store.commit('list/setCurrentList', model)
  }
})

Query.on('afterDelete', function (model) {
  if (model
    && model instanceof List
    && store.state.list?.currentList?._id === model._id
  ) {
    store.commit('list/setCurrentList', {'null': true})
  }
})

export default {
  module() {
    return {
      namespaced: true,
      state: () => ({
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
            logger.debug('LIST doSet()', list)
            const previousList = state.currentList
            if (list) {
              if (!(list instanceof List)) {
                throw new Error('Invalid list! ' + JSON.stringify(list))
              }
              state.lastList = list
              state.lastListId = list?._id
            }
            logger.debug('setCurrentList', list)
            state.currentList = list
            state.currentListId = list?._id

            eventBus.$emit('list_set::after', list, previousList)
          }

          if (payload.null === true) {
            doSet(null)
          } else if (payload.list instanceof List) {
            doSet(payload.list)
          } else if (payload.id) {
            doSet(loadList(payload.id))
          } else {
            throw "Invalid argument for setCurrentList()!"
          }
        },
        setDisplayMode (state, payload) {
          state.displayMode = payload.mode
        },
        reset(state) {
          logger.debug('list/reset')
          state.currentList = null
          state.currentListId = null
          state.lastList = null
          state.lastListId = null
          state.displayMode = DISPLAY_MODE_UNCHECKED_ONLY
        }
      },
      actions: {
        reset({commit}) {
          commit('reset')
        }
      }
    }
  }
}
