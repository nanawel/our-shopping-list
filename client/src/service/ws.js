import { sock } from '@/service/socket-io'

export default {
  install: (Vue, { store }) => {
    sock.on("connect", () => {
      sock.emit("hello", { connectionDate: new Date().toISOString() }, (data) => {
        console.info('Reply to Hello from server: ', data)

        if ((store.state.version.currentVersion === null || store.state.version.currentBuildId === null)
          && (data.version || data.buildId)
        ) {
          store.commit('version/setCurrentVersion', { version: data.version, buildId: data.buildId })
        } else {
          if (store.state.version.currentVersion != data.version
            || store.state.version.currentBuildId != data.buildId
          ) {
            console.warn('Server version mismatch, reloading app.')
            alert("The application has been updated.\nThis page will now be reloaded automatically.")
            store.$app.forceRefresh()
          }
        }
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
