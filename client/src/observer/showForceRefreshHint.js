import eventBus from '@/service/event-bus'
import store from '@/store'
import config from '@/config'
import i18n from '@/i18n'

const forceRefreshHintShownKey = config.VUE_APP_LOCALSTORAGE_KEY_PREFIX + 'forceRefreshHintShown'

export default {
  install() {
    eventBus.$on('app-mounted', function () {
      if (!window.localStorage.getItem(forceRefreshHintShownKey)) {
        console.log(i18n.t('ok-thanks'));
        store.commit('dialog/showMessage', {
          title: i18n.t('notice.force-refresh-hint-title'),
          message: i18n.t('notice.force-refresh-hint-message'),
          closeButtonLabel: i18n.t('ok-thanks')
        })
        window.localStorage.setItem(forceRefreshHintShownKey, true)
      }
    })
  }
}
