import path from 'path-browserify'

const config = {}
Object.entries(window)
  .filter(([k]) => {
    return k.startsWith('VITE_APP_') || k === 'BASE_URL' || k === 'DEBUG'
  })
  .map(([k, v]) => {
    // Custom web root support (#58/GITHUB#18)
    if (k === 'BASE_URL') {
      config['BASE_URL_ORIG'] = v
      /**
       * Normalize base URL
       * ///my/path//  =>  my/path/
       */
      v = path.normalize(v)
        .replace(/^\/+/, '')
    }
    config[k] = v
  })

console.info('Current configuration', config)

if (config.DEBUG) {
  localStorage.debug = config.DEBUG
}

export default config
