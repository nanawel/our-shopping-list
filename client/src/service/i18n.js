import {createI18n, useI18n} from 'vue-i18n'

import config from '@/config'
import {logger} from '@/service/logger'

/**
 * @see https://phrase.com/blog/posts/ultimate-guide-to-vue-localization-with-vue-i18n/
 */
function loadLocaleMessages() {
  const locales = import.meta.glob('@/locales/*.json', {
    eager: true, // => disable loading by promise
    import: 'default'
  })
  const messages = {}
  Object.keys(locales).forEach((key) => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i)
    if (matched?.length > 1) {
      const locale = matched[1]
      logger.info('[i18n] Found locale:', locale)
      messages[locale] = locales[key]
    }
  })
  return messages
}

function getLocale() {
  if (config.VITE_APP_I18N_FORCE_LOCALE) {
    logger.info('[i18n] Forced locale to:', config.VITE_APP_I18N_LOCALE)
    return config.VITE_APP_I18N_LOCALE
  }
  const detectedLocale = navigator.language.split('-')[0]
  logger.info('[i18n] Detected locale:', detectedLocale)
  return detectedLocale
}

const i18n = createI18n({
  legacy: true, // Keep API mode instead of Composition mode for now
  locale: getLocale(),
  fallbackLocale: config.VITE_APP_I18N_FALLBACK_LOCALE,
  messages: loadLocaleMessages()
})

const i18nPlugin = {
  install(app) {
    app.use(i18n)
  }
}

export {
  i18nPlugin,
  i18n
}
