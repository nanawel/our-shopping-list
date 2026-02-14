import eventBus from '@/service/event-bus'
import {store} from '@/service/store'
import config from '@/config'
import {i18n} from '@/service/i18n'

const forceRefreshHintShownKey = config.VITE_APP_LOCALSTORAGE_KEY_PREFIX + 'forceRefreshHintShown'

export default {
  install() {
    if (!config.VITE_APP_HIDE_FORCE_REFRESH_HINT) {
      eventBus.$on('app-mounted', function () {
        if (!window.localStorage.getItem(forceRefreshHintShownKey)) {
          store.commit('dialog/showMessage', {
            title: i18n.global.t('notice.force-refresh-hint-title'),
            message: i18n.global.t('notice.force-refresh-hint-message'),
            closeButtonLabel: i18n.global.t('ok-thanks')
          })
          window.localStorage.setItem(forceRefreshHintShownKey, true)
        }
      })
    }
  }
}
