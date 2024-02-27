import {ref} from 'vue'
import {store} from '@/service/store'

const isReloading = ref(false)

const softRefresh = function() {
  isReloading.value = true
  store.replaceState({})
  window.location.reload()
}
const hardRefresh = function() {
  isReloading.value = true
  store.replaceState({})
  window.localStorage.clear()
  window.location.reload()
}

export {
  softRefresh,
  hardRefresh,
  isReloading
}
