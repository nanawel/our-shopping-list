import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import {createVuetify} from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import config from '@/config';

let defaultTheme
switch (String(config.VITE_APP_THEME).toLowerCase()) {
  case 'light':
    defaultTheme = 'light'
    break
  case 'dark':
    defaultTheme = 'dark'
    break
  default:
    defaultTheme = 'system'
}

const opts = {
  components,
  directives,
  theme: {
    defaultTheme: defaultTheme,
  },
}

export default createVuetify(opts)
