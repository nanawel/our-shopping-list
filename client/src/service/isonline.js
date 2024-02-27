import {ref} from 'vue'

let isOnline = ref(navigator.onLine)
const updateConnectionStatus = function() {
  isOnline.value = navigator.onLine
}
window.addEventListener('online', updateConnectionStatus)
window.addEventListener('offline', updateConnectionStatus)
updateConnectionStatus()

export default isOnline
