import VueLogger from 'vue-logger-plugin'
import config from "@/config";

const options = {
  enabled: config.VUE_APP_CLIENT_LOG_ENABLED,
  consoleEnabled: config.VUE_APP_CLIENT_LOG_CONSOLE_ENABLED,
  level: config.VUE_APP_CLIENT_LOG_LEVEL,
}
if (options.level === 'debug') {
  console.warn(
    'Log level is set to DEBUG. You might need to enable this debug level in your browser to see its output.'
  )
}

export default new VueLogger(options)
