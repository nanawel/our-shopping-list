import {logger} from '@/service/logger'
import eventBus from '@/service/event-bus'
import {store} from '@/service/store'
import {Mutex, withTimeout} from 'async-mutex'
import {apm} from '@/service/apm'

import Board from '@/models/Board'
import Item from '@/models/Item'
import List from '@/models/List'

class Repository {
  constructor() {
    this.schemaMapping = {
      Board,
      Item,
      List,
    }
    this.syncMutex = withTimeout(new Mutex(), 10000)
  }

  findSchemaByClassName(className) {
    if (!this.schemaMapping[className]) {
      throw ('Invalid model class name: ' + className)
    }

    return this.schemaMapping[className]
  }

  findSchemaByModel(model) {
    const schemas = Object.values(this.schemaMapping).filter((s) => {
      return model instanceof s
    })

    if (schemas.length === 0) {
      throw ('Invalid model: ' + JSON.stringify(model))
    }

    return schemas[0]
  }

  getAll(schema) {
    logger.debug('$repository::getAll', schema.name)

    return schema.all()
  }

  syncAll(schema) {
    logger.debug('$repository::syncAll', schema.name)
    const apmSpan = apm.startSpan('service/repository::syncAll')
    apmSpan.addLabels([schema])

    schema.deleteAll()
    return schema.api()
      .get(`/${schema.entity}`)
      .catch((e) => {
        logger.error(e)
      })
      .finally(() => {
        apmSpan.end()
      })
  }

  save(model) {
    logger.debug('$repository::save', model)
    const apmSpan = apm.startSpan('service/repository::save')
    apmSpan.addLabels([model.constructor.name])

    const schema = this.findSchemaByModel(model)

    eventBus.$emit('repository_save::before', model, schema)

    return new Promise((resolve, reject) => {
      if (model._id) {
        schema.api()
          .patch(`/${schema.entity}/${model._id}`, model)
          .then((response) => {
            resolve(response.entities[schema.entity][0])
          })
          .catch(reject)
          .finally(() => {
            apmSpan.end()
          })
      } else {
        return schema.api()
          .post(`/${schema.entity}`, model)
          .then((response) => {
            resolve(response.entities[schema.entity][0])
          })
          .catch(reject)
          .finally(() => {
            apmSpan.end()
          })
      }
    })
  }

  delete(model) {
    logger.debug('$repository::delete', model)
    const apmSpan = apm.startSpan('service/repository::delete')
    apmSpan.addLabels([model.constructor.name])

    const schema = this.findSchemaByModel(model)

    eventBus.$emit('repository_delete::before', model, schema)

    if (model._id) {
      return schema.api()
        .delete(`/${schema.entity}/${model._id}`, { delete: 1 })
        .then(() => {
          // https://vuex-orm.github.io/plugin-axios/guide/usage.html#delete-requests
          return model
            .$delete()
            .then(() => {
              eventBus.$emit('repository_delete::after', model, schema)
            })
            .finally(() => {
              apmSpan.end()
            })
        })
    } else {
        return model
          .$delete()
          .then(() => {
            eventBus.$emit('repository_delete::after', model, schema)
          })
          .finally(() => {
            apmSpan.end()
          })
    }
  }

  async checkSync(model) {
    const self = this

    logger.debug('$repository::checkSync', model, model.constructor.name)
    const apmSpan = apm.startSpan('service/repository::checkSync')
    apmSpan.addLabels([model.constructor.name])

    const schema = this.findSchemaByModel(model)

    const origId = model._id
    if (store.getters['modelSync/isSyncInProgress'](schema, origId)) {
      logger.warn(`Cancelling sync for model ${schema.entity}/${model._id}: already in progress.`)
      return
    }
    store.commit('modelSync/syncing', {schema, id: origId})

    try {
      if (model._id) {
        await fetch(`./${schema.entity}/${model._id}`, {
            method: 'HEAD'
          })
          .then(async function(res) {
            if (!res.ok) {
              switch (res.status) {
                case 404:
                  // Model does not exist (anymore) on server: it should not exist on client either
                  logger.warn(`Model ${schema.entity}/${model._id} not found on server: deleting.`)
                  model.$delete()
                  return true
              }
              logger.error(`[${res.status}] ${res.statusText}`)
              throw {
                reason: res.statusText,
                originalError: res
              }
            } else {
              const lastModified = new Date(res.headers.get('last-modified-iso'))
              const modelUpdatedAt = new Date(model.updatedAt)
              const isUpToDate = lastModified.getTime() === modelUpdatedAt.getTime()

              if (!isUpToDate) {
                return await self.sync(model)
              }
              return isUpToDate
            }
          })
          .catch(function(error) {
            throw {
              reason: 'Network error',
              originalError: error
            }
          })
      }
      else {
        logger.info('Will not check sync a model with no ID')
      }
    }
    finally {
      logger.debug('$repository::checkSync complete', model, model.constructor.name)
      store.commit('modelSync/syncComplete', {schema, id: origId})
      apmSpan.end()
    }
  }

  async sync(model) {
    const self = this

    await this.syncMutex.runExclusive(function() {
      logger.debug('$repository::sync', model)

      if (model._id) {
        const apmSpan = apm.startSpan('service/repository::sync')
        apmSpan.addLabels([model.constructor.name])

        const schema = self.findSchemaByModel(model)

        return schema.api()
          .get(`/${schema.entity}/${model._id}`)
          .catch((e) => {
            // The model does not seem to exist (anymore) so remove it from local store
            if (e.response && e.response.status === 404) {
              schema.delete(model._id)
            }
          })
          .finally(() => {
            apmSpan.end()
          })
      }
    })
  }
}

const repository = new Repository()

const repositoryPlugin = {
  install(app) {
    app.config.globalProperties.$repository = repository
  }
}

export {
  repositoryPlugin,
  repository
}

