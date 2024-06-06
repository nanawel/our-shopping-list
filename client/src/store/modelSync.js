import {logger} from '@/service/logger'

const SYNC_TIMEOUT = 60000

export default {
  module() {
    return {
      namespaced: true,
      state: () => ({
        inProgress: {},
      }),
      mutations: {
        syncing(state, payload) {
          logger.debug('modelSync/syncing', payload, state)
          state.inProgress[`${payload.schema}/${payload.id}`] = Date.now()
        },
        syncComplete(state, payload) {
          logger.debug('modelSync/syncComplete', payload, state)
          delete state.inProgress[`${payload.schema}/${payload.id}`]
        },
      },
      getters: {
        isSyncInProgress: (state) => (schema, id) => {
          const r = (state.inProgress[`${schema}/${id}`] || 0) > Date.now() - SYNC_TIMEOUT
          logger.debug('modelSync/isSyncInProgress?', schema, id, r)
          return r
        }
      }
    }
  }
}
