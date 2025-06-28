import {apmBase} from '@elastic/apm-rum'
import {ApmVuePlugin} from '@elastic/apm-rum-vue'

import {router} from '@/router'

import config from '@/config'

const apmPlugin = {
  install(app) {
    if (config.VITE_APP_APM_ENABLED
      && config.VITE_APP_APM_SERVERURL
      && config.VITE_APP_APM_SERVICENAME
    ) {
      console.info('APM is ENABLED', config.VITE_APP_APM_SERVICENAME)
      app.use(ApmVuePlugin, {
        router,
        config: {
          serviceName: config.VITE_APP_APM_SERVICENAME,
          serverUrl: config.VITE_APP_APM_SERVERURL,
          serverUrlPrefix: config.VITE_APP_APM_SERVERURLPREFIX,
          logLevel: config.VITE_APP_APM_LOGLEVEL || 'warn'
        }
      })
    }
  }
}

const fakeObject = new Proxy({}, {
  get() {
    return () => fakeObject
  }
})

const apmProxy = new Proxy(apmBase, {
  get(target, prop/*, receiver*/) {
    return function (...args) {
      let result = Reflect.apply(target[prop], this, args)
      if (typeof result === 'undefined') {
        switch (prop) {
          case 'startSpan':
            result = fakeObject
            break
        }
      }
      return result
    }
  }
})

export {
  apmPlugin,
  apmProxy as apm,
  apmProxy
}
