import logger from '@/service/logger'
import eventBus from '@/service/event-bus'

import Board from '@/models/Board'
import Item from '@/models/Item'
import List from '@/models/List'

const Repository = function() {
  const schemaMapping = {
    Board,
    Item,
    List,
  }

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
      });

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

      return schema.api()
        .get(`/${schema.entity}`)
        .catch((e) => {
          logger.error(e)
        })
    },
    save(model) {
      logger.debug('$repository::save', model)
      const schema = this.findSchemaByModel(model)

      eventBus.$emit('repository_save::before', model, schema)

      if (model._id) {
        return schema.api()
          .patch(`/${schema.entity}/${model._id}`, model)
      } else {
        return schema.api()
          .post(`/${schema.entity}`, model)
      }
    },

    delete(model) {
      logger.debug('$repository::delete', model)
      const schema = this.findSchemaByModel(model)

      eventBus.$emit('repository_delete::before', model, schema)

      if (model._id) {
        return schema.api()
          .delete(`/${schema.entity}/${model._id}`, { delete: 1 })
          .then(() => {
            // https://vuex-orm.github.io/plugin-axios/guide/usage.html#delete-requests
            return model.$delete()
          })
      } else {
          return model.$delete()
      }
    },
    checkSync(model) {
      logger.debug('$repository::checkSync', model, model.constructor.name)
      const schema = this.findSchemaByModel(model)

      return new Promise((resolve, reject) => {
        if (model._id) {
          fetch(`/${schema.entity}/${model._id}`, {
              method: 'HEAD'
            })
            .then(function(res) {
              if (!res.ok) {
                switch (res.status) {
                  case 404:
                    // Model does not exist (anymore) on server: it should not exist either on client
                    logger.warn(`Model ${schema.entity}/${model._id} not found on server: deleting.`)
                    model.$delete()
                    break
                }
                logger.error(`[${res.status}] ${res.statusText}`)
              } else {
                const lastModified = new Date(res.headers.get('last-modified-iso'))
                const modelUpdatedAt = new Date(model.updatedAt)
                resolve(lastModified.getTime() === modelUpdatedAt.getTime())
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
      })
    },
    async sync(model) {
      logger.debug('$repository::sync', model)

      if (model._id) {
        const schema = this.findSchemaByModel(model)

        return schema.api()
          .get(`/${schema.entity}/${model._id}`)
          .catch((e) => {
            // The model does not seem to exist (anymore) so remove it from local store
            if (e.response && e.response.status === 404) {
              schema.delete(model._id)
            }
          })
      }
    }
  }
}


export default new Repository
