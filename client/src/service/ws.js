import { sock } from '@/service/socket-io'

export default {
  install: (Vue, { store }) => {
    sock.on("connect", () => {
      sock.emit("hello", { connectionDate: new Date().toISOString() }, (data) => {
        console.info('Reply to Hello from server: ', data)

        let shouldRefresh = false
        let isStoreInitialized = false
        for (const k in store.state.version) {
          if (store.state.version[k] !== null) {
            isStoreInitialized = true
            break
          }
        }

        if (isStoreInitialized) {
          Object.keys(data.serverVersion).forEach((k) => {
            if (data.serverVersion[k]
              && data.serverVersion[k] !== store.state.version[k]
            ) {
              shouldRefresh = true
            }
          })
        }

        if (shouldRefresh) {
          console.warn('Server version mismatch, reloading app.')
          alert("The application has been updated.\nThis page will now be reloaded automatically.")
          store.$app.forceRefresh()
          return
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
