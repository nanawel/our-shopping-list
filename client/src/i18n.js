import Vue from 'vue'
import VueI18n from 'vue-i18n'

import config from '@/config'
import logger from '@/service/logger'

Vue.use(VueI18n)

/**
 * @see https://phrase.com/blog/posts/ultimate-guide-to-vue-localization-with-vue-i18n/
 */
function loadLocaleMessages() {
  const locales = require.context(
    '@/locales',
    true,
    /[A-Za-z0-9-_,\s]+\.json$/i
  )
  const messages = {}
  locales.keys().forEach(key => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i)
    if (matched && matched.length > 1) {
      const locale = matched[1]
      logger.info('[i18n] Found locale: ', locale)
      messages[locale] = locales(key)
    }
  })
  return messages
}

function getLocale() {
  if (config.VUE_APP_I18N_FORCE_LOCALE) {
    return config.VUE_APP_I18N_LOCALE
  }
  return navigator.language.split('-')[0]
}

export default new VueI18n({
  locale: getLocale(),
  fallbackLocale: config.VUE_APP_I18N_FALLBACK_LOCALE,
  messages: loadLocaleMessages()
})
