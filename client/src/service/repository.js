import {logger} from '@/service/logger'
import eventBus from '@/service/event-bus'
import {apm} from '@/service/apm'
import {Mutex, withTimeout} from 'async-mutex'

import Board from '@/models/Board'
import Item from '@/models/Item'
import List from '@/models/List'

const Repository = function() {
  const schemaMapping = {
    Board,
    Item,
    List,
  }
  const syncMutex = withTimeout(new Mutex(), 5000)

  return {
    findSchemaByClassName(className) {
      if (!schemaMapping[className]) {
        throw ('Invalid model class name: ' + className)
      }

      return schemaMapping[className]
    },
    findSchemaByModel(model) {
      const schemas = Object.values(schemaMapping).filter((s) => {
        return model instanceof s
      })

      if (schemas.length === 0) {
        throw ('Invalid model: ' + JSON.stringify(model))
      }

      return schemas[0]
    },
    getAll(schema) {
      logger.debug('$repository::getAll', schema.name)

      return schema.all()
    },
    syncAll(schema) {
      logger.debug('$repository::syncAll', schema.name)
      const apmSpan = apm.startSpan('$repository::syncAll')
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
    },
    save(model) {
      logger.debug('$repository::save', model)
      const apmSpan = apm.startSpan('$repository::save')
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
    },
    delete(model) {
      logger.debug('$repository::delete', model)
      const apmSpan = apm.startSpan('$repository::delete')
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
              .finally(() => {
                apmSpan.end()
              })
          })
      } else {
          return model
            .$delete()
            .finally(() => {
              apmSpan.end()
            })
      }
    },
    checkSync(model, autoSync) {
      const self = this
      autoSync = typeof autoSync === 'undefined' ? true : autoSync

      logger.debug('$repository::checkSync', model, model.constructor.name, autoSync)
      const apmSpan = apm.startSpan('$repository::checkSync')
      apmSpan.addLabels([model.constructor.name])

      const schema = this.findSchemaByModel(model)

      return new Promise((resolve, reject) => {
        if (model._id) {
          fetch(`./${schema.entity}/${model._id}`, {
              method: 'HEAD'
            })
            .then(function(res) {
              if (!res.ok) {
                switch (res.status) {
                  case 404:
                    // Model does not exist (anymore) on server: it should not exist on client either
                    logger.warn(`Model ${schema.entity}/${model._id} not found on server: deleting.`)
                    model.$delete()
                    break
                }
                logger.error(`[${res.status}] ${res.statusText}`)
              } else {
                const lastModified = new Date(res.headers.get('last-modified-iso'))
                const modelUpdatedAt = new Date(model.updatedAt)
                const isUpToDate = lastModified.getTime() === modelUpdatedAt.getTime()

                if (!isUpToDate && autoSync) {
                  resolve(self.sync(model))
                } else {
                  resolve(isUpToDate)
                }
              }
            })
            .catch(function(error) {
              reject({
                reason: 'Network error',
                originalError: error
              })
            })
        }
        else {
          reject({
            reason: 'Model has no ID'
          })
        }
      }).finally(() => {
        apmSpan.end()
      })
    },
    async sync(model) {
      const self = this

      await syncMutex.runExclusive(function() {
        logger.debug('$repository::sync', model)

        if (model._id) {
          const apmSpan = apm.startSpan('$repository::sync')
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

