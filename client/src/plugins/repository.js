import Item from '../models/Item'
import List from '../models/List'

export default {
  install: (Vue, { store }) => {
    if (!store) {
      throw new Error('Please provide vuex store.')
    }

    const schemaMapping = {
      'Item': Item,
      'List': List,
    }

    Vue.prototype.$repository = {
      findSchemaByClassName: function(className) {
        if (!schemaMapping[className]) {
          throw ('Invalid model class name: ' + className)
        }

        return schemaMapping[className]
      },
      findSchemaByModel: function(model) {
        const schemas = Object.values(schemaMapping).filter((s) => {
          return model instanceof s
        });

        if (schemas.length === 0) {
          throw ('Invalid model: ' + JSON.stringify(model))
        }

        return schemas[0]
      },
      save: function(model) {
        console.log('$repository::save', model);
        const schema = this.findSchemaByModel(model)

        if (model._id) {
          return schema.api()
            .patch(`/${schema.entity}/${model._id}`, model)
        } else {
          return schema.api()
            .post(`/${schema.entity}`, model)
        }
      },
      delete: function(model) {
        console.log('$repository::delete', model);
        const schema = this.findSchemaByModel(model)

        if (model._id) {
          return schema.api()
            .delete(`/${schema.entity}/${model._id}`, { delete: 1 })
            .then(() => {
              // https://vuex-orm.github.io/plugin-axios/guide/usage.html#delete-requests
              model.$delete()
            })
        } else {
            model.$delete()
        }
      }
    }
    Vue.$repository = Vue.prototype.$repository
  },
}
