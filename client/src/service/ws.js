import {sock} from '@/service/socket-io'
import i18n from '@/i18n'
import config from '@/config'

const serverHashKey = config.VUE_APP_LOCALSTORAGE_KEY_PREFIX + 'serverHash'

export default {
  install: (Vue, { store }) => {
    sock.on('connect', () => {
      sock.emit('hello', { connectionDate: new Date().toISOString() }, (data) => {
        console.info('Reply to Hello from server: ', data)

        if (data.serverHash) {
          let shouldRefresh = false
          if (!localStorage.getItem(serverHashKey)) {
            localStorage.setItem(serverHashKey, data.serverHash)
          } else if (localStorage.getItem(serverHashKey) !== data.serverHash) {
            shouldRefresh = true
          }

          if (shouldRefresh) {
            console.warn('Server version mismatch, reloading app.')
            alert(i18n.t('notice.application-updated-alert'))
            store.$app.forceRefresh()
            return
          }
        }

        // Set current version / build ID / config hash
        store.commit('version/setCurrentVersion', data.serverVersion)
      })
    })

    //
    // ORM SYNC
    sock.on("model-update", (data) => {
      console.log('ORM WS :: MODEL UPDATE', data)
      const schema = Vue.$repository.findSchemaByClassName(data.type)
      if (!schema) {
        console.warn('Unknown model type: ', data.type)
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

    sock.on("model-delete", (data) => {
      console.log('ORM WS :: MODEL DELETE', data)
      const schema = Vue.$repository.findSchemaByClassName(data.type)
      if (!schema) {
        console.warn('Unknown model type: ', data.type)
        return
      }
      const model = data.model

      schema.delete(model._id)
    })

    Vue.prototype.$ws = sock
  },
}
