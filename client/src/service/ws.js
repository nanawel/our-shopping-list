import {sock} from '@/service/socket-io'
import i18n from '@/i18n'
import config from '@/config'
import logger from '@/service/logger'

const serverHashKey = config.VUE_APP_LOCALSTORAGE_KEY_PREFIX + 'serverHash'

export default {
  install: (Vue, { store }) => {
    sock.on('connect', () => {
      sock.emit('hello', { connectionDate: new Date().toISOString() }, (data) => {
        logger.info('Reply to Hello from server: ', data)

        if (data.serverHash) {
          let shouldRefresh = false
          if (!localStorage.getItem(serverHashKey)) {
            localStorage.setItem(serverHashKey, data.serverHash)
          } else if (localStorage.getItem(serverHashKey) !== data.serverHash) {
            shouldRefresh = true
          }

          if (shouldRefresh) {
            logger.warn('Server version mismatch, reloading app.')
            alert(i18n.t('notice.application-updated-alert'))
            localStorage.removeItem(serverHashKey)
            store.$app.hardRefresh()
            return
          }
        }

        // Set current version / build ID / config hash
        store.commit('version/setCurrentVersion', data.serverVersion)
      })
    })

    //
    // ORM SYNC
    sock.on('model-update', (data) => {
      logger.debug('ORM WS :: MODEL UPDATE', data)
      const schema = Vue.$repository.findSchemaByClassName(data.type)
      if (!schema) {
        logger.warn('Unknown model type: ', data.type)
        return
      }
      const model = data.model

      if (!schema.find(model._id)) {
        schema.insert({
          data: model
        })
      } else {
        schema.update({
          where: model._id,
          data: model
        })
      }
    })

    sock.on('model-delete', (data) => {
      logger.debug('ORM WS :: MODEL DELETE', data)
      const schema = Vue.$repository.findSchemaByClassName(data.type)
      if (!schema) {
        logger.warn('Unknown model type: ', data.type)
        return
      }
      const model = data.model

      schema.delete(model._id)
    })

    Vue.prototype.$ws = sock
  },
}
