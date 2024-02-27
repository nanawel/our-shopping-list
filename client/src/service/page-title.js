import config from '@/config'

const setPageTitle = function(title, replace) {
  const suffix = config.VUE_APP_TITLE || 'Our Shopping List'
  if (title) {
    document.title = (replace) ? title : `${title} :: ${suffix}`
  } else {
    document.title = suffix
  }
}

export {
  setPageTitle
}
