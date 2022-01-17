export default store => {
  const data = localStorage.getItem('oslAppState')
  if (data) {
    store.replaceState(Object.assign(store.state, JSON.parse(data)))
  }

  // Register a tiny module to handle the "clearLocalState" action
  store.registerModule('localStoragePlugin', {
    actions: {
      clearLocalState() {
        localStorage.removeItem('oslAppState')
        console.warn('localStorage CLEARED')
      }
    }
  })

  // Sync localStorage with each update of the store's state
  store.subscribe((mutation, state) => {
    if (store.$app && !store.$app.isReloading) {
      localStorage.setItem('oslAppState', JSON.stringify(state))
    }
  })
}
