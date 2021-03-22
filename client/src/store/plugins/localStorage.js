export default store => {
  store.subscribe((mutation, state) => {
    localStorage.setItem('oslAppState', JSON.stringify(state))
  })
}
