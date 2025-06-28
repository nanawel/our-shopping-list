import config from '@/config'

import {socket} from '@/service/socket-io'
import {i18n} from '@/service/i18n'
import {hardRefresh} from '@/service/refresh'
import {store} from '@/service/store'
import {repository} from '@/service/repository'
import eventBus from '@/service/event-bus'
import {logger} from '@/service/logger'

const serverHashKey = config.VITE_APP_LOCALSTORAGE_KEY_PREFIX + 'serverHash'

export default {
  install: (app) => {
    socket.on('connect', () => {
      logger.debug('Socket connected', socket)
      if (socket.recovered) {
        logger.info('Socket connection recovered.')
        //eventBus.$emit('ws::recovered')
      } else {
        socket.emit('hello', { connectionDate: new Date().toISOString() }, (data) => {
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
              alert(i18n.global.t('notice.application-updated-alert'))
              localStorage.removeItem(serverHashKey)
              hardRefresh()
              return
            }
          }

          // Set current version / build ID / config hash
          store.commit('version/setCurrentVersion', data.serverVersion)

          eventBus.$emit('ws::connected')
        })
      }
    })

    //
    // ORM SYNC
    socket.on('model-update', (data) => {
      logger.debug('ORM WS :: MODEL UPDATE', data)
      const schema = repository.findSchemaByClassName(data.type)
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

    socket.on('model-delete', (data) => {
      logger.debug('ORM WS :: MODEL DELETE', data)
      const schema = repository.findSchemaByClassName(data.type)
      if (!schema) {
        logger.warn('Unknown model type: ', data.type)
        return
      }
      const model = data.model

      schema.delete(model._id)
    })

    app.config.globalProperties.$ws = socket
  },
}
