import { DISPLAY_MODE_UNCHECKED_ONLY } from '@/constants'
import List from "@/models/List";

const loadList = function ({state}, listId) {
  console.log('loadList', ...arguments);

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
        console.error(e);
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

export default {
  namespaced: true,
  state: () => ({
    currentList: null,
    displayMode: DISPLAY_MODE_UNCHECKED_ONLY
  }),
  actions: {
    syncList (context) {
      if (context.state.currentList && context.state.currentList._id) {
        loadList(context, context.state.currentList._id)
      }
    }
  },
  mutations: {
    setCurrentList (state, payload) {
      console.log('setCurrentList', payload);
      if (payload.list instanceof List) {
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
