import eventBus from '@/service/event-bus'
import router from '@/router'
import config from '@/config'

const currentBoardSlugKey = config.VUE_APP_LOCALSTORAGE_KEY_PREFIX + 'currentBoardSlug'
const currentListSlugKey = config.VUE_APP_LOCALSTORAGE_KEY_PREFIX + 'currentListId'

export default {
  install() {
    eventBus.$on('app-created', function () {
      const lsBboardSlug = window.localStorage.getItem(currentBoardSlugKey)
      const lsListId = window.localStorage.getItem(currentListSlugKey)

      const currentRouteParams = router.history.current.params
      if (currentRouteParams.boardSlug || currentRouteParams.listId) {
        // Route params have a higher priority, so don't force any redirection if any is present
        return
      }

      if (lsBboardSlug) {
        if (lsListId) {
          router.push({name: 'list', params: {boardSlug: lsBboardSlug, listId: lsListId}})
        } else {
          router.push({name: 'board', params: {boardSlug: lsBboardSlug}})
        }
      }
    })

    eventBus.$on('board_set::after', function (board) {
      if (board && board._id) {
        window.localStorage.setItem(currentBoardSlugKey, board.slug)
      } else {
        window.localStorage.removeItem(currentBoardSlugKey)
      }
    })

    eventBus.$on('list_set::after', function (list) {
      if (list && list._id) {
        window.localStorage.setItem(currentListSlugKey, list._id)
      } else {
        window.localStorage.removeItem(currentListSlugKey)
      }
    })
  }
}
