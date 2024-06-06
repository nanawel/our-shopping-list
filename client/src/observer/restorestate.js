import eventBus from '@/service/event-bus'
import {router, useRoute} from '@/router'
import {store} from '@/service/store'
import {logger} from '@/service/logger'
import config from '@/config'

const currentBoardSlugKey = config.VUE_APP_LOCALSTORAGE_KEY_PREFIX + 'currentBoardSlug'
const currentListSlugKey = config.VUE_APP_LOCALSTORAGE_KEY_PREFIX + 'currentListId'

export default {
  install() {
    eventBus.$on('app-created', function () {
      const lsBoardSlug = window.localStorage.getItem(currentBoardSlugKey)
      const lsListId = window.localStorage.getItem(currentListSlugKey)

      const currentRouteParams = useRoute().params
      if (currentRouteParams.boardSlug || currentRouteParams.listId) {
        // Route params have a higher priority, so don't force any redirection if any is present
        return
      }

      if (lsBoardSlug) {
        if (lsListId) {
          router.push({name: 'list', params: {boardSlug: lsBoardSlug, listId: lsListId}})
        } else {
          router.push({name: 'board', params: {boardSlug: lsBoardSlug}})
        }
      }
    })

    store.watch(
      (state) => state.board?.currentBoard?.slug,
      (newValue, oldValue) => {
        logger.debug(`observer/restorestate (board) :: Updating from ${oldValue} to ${newValue}`)
        if (oldValue) {
          window.localStorage.removeItem(currentBoardSlugKey)
        }
        if (newValue) {
          window.localStorage.setItem(currentBoardSlugKey, newValue)
        }
      }
    )

    store.watch(
      (state) => state.list?.currentListId,
      (newValue, oldValue) => {
        logger.debug(`observer/restorestate (list) :: Updating from ${oldValue} to ${newValue}`)
        if (oldValue) {
          window.localStorage.removeItem(currentListSlugKey)
        }
        if (newValue) {
          window.localStorage.setItem(currentListSlugKey, newValue)
        }
      }
    )
  }
}
