import path from 'path';

const mode = process.env.VITE_APP_ENV || process.env.NODE_ENV || 'production';

let baseUrl = path.normalize(process.env.BASE_URL || '')  // Custom web root support (#58/GITHUB#18)
    .replace(/^(\/|\s)+/, '')
    .replace(/(\/|\s)+$/, '')
    .concat('/');

if (mode === 'development' && baseUrl !== '/') {
  baseUrl = '/';
  console.warn('WARN: Cannot use a custom BASE_URL in development mode. Ignoring.');
}

let config = {
  BASE_URL: baseUrl,
  DEBUG: process.env.DEBUG || '',
  VITE_APP_APM_ENABLED: !!parseInt(process.env.VITE_APP_APM_ENABLED),
  VITE_APP_APM_LOGLEVEL: process.env.VITE_APP_APM_LOGLEVEL || 'warn',
  VITE_APP_APM_SERVERURL: process.env.VITE_APP_APM_SERVERURL || '',
  VITE_APP_APM_SERVERURLPREFIX: process.env.VITE_APP_APM_SERVERURLPREFIX || '',
  VITE_APP_APM_SERVICENAME: process.env.VITE_APP_APM_SERVICENAME || '',
  VITE_APP_BOARD_DELETION_ENABLED: !!parseInt(process.env.VITE_APP_BOARD_DELETION_ENABLED),
  VITE_APP_CHECKED_ITEMS_HISTORY_SORT_FIELD: process.env.VITE_APP_CHECKED_ITEMS_HISTORY_SORT_FIELD || 'lastCheckedAt',
  VITE_APP_CHECKED_ITEMS_HISTORY_SORT_ORDER: process.env.VITE_APP_CHECKED_ITEMS_HISTORY_SORT_ORDER || 'desc',
  VITE_APP_CLIENT_LOG_CONSOLE_ENABLED: !!parseInt(process.env.VITE_APP_CLIENT_LOG_CONSOLE_ENABLED),
  VITE_APP_CLIENT_LOG_ENABLED: !!parseInt(process.env.VITE_APP_CLIENT_LOG_ENABLED),
  VITE_APP_CLIENT_LOG_LEVEL: process.env.VITE_APP_CLIENT_LOG_LEVEL || 'debug',
  VITE_APP_DISABLE_AGRESSIVE_ASSETS_CACHING: !!parseInt(process.env.VITE_APP_DISABLE_AGRESSIVE_ASSETS_CACHING),
  VITE_APP_DISABLE_CONTEXTMENU: !!parseInt(process.env.VITE_APP_DISABLE_CONTEXTMENU),
  VITE_APP_EDIT_ITEM_ON_CREATE: !!parseInt(process.env.VITE_APP_EDIT_ITEM_ON_CREATE),
  VITE_APP_ENV: mode,
  VITE_APP_HOME_MESSAGE: process.env.VITE_APP_HOME_MESSAGE || '',
  VITE_APP_I18N_FALLBACK_LOCALE: process.env.VITE_APP_I18N_FALLBACK_LOCALE || 'en',
  VITE_APP_I18N_FORCE_LOCALE: !!parseInt(process.env.VITE_APP_I18N_FORCE_LOCALE),
  VITE_APP_I18N_LOCALE: process.env.VITE_APP_I18N_LOCALE || 'en',
  VITE_APP_LIST_ALL_BOARDS_ENABLED: !!parseInt(process.env.VITE_APP_LIST_ALL_BOARDS_ENABLED),
  VITE_APP_LOCALSTORAGE_KEY_PREFIX: process.env.VITE_APP_LOCALSTORAGE_KEY_PREFIX || 'OurShoppingList_',
  VITE_APP_SHORT_TITLE: process.env.VITE_APP_SHORT_TITLE || 'OSL',
  VITE_APP_SINGLEBOARD_ID: process.env.VITE_APP_SINGLEBOARD_ID || '00000000-0000-0000-0000-000000000000',
  VITE_APP_SINGLEBOARD_MODE: !!parseInt(process.env.VITE_APP_SINGLEBOARD_MODE),
  VITE_APP_SINGLEBOARD_SLUG: process.env.VITE_APP_SINGLEBOARD_SLUG || '_',
  /** @see https://socket.io/docs/v4/server-options/#connectionstaterecovery */
  VITE_APP_SOCKETIO_CSR_MAXDISCONNECTIONDURATION: process.env.VITE_APP_SOCKETIO_CSR_MAXDISCONNECTIONDURATION || (30 * 60 * 1000),
  /** @see https://socket.io/docs/v4/server-options/#pinginterval */
  VITE_APP_SOCKETIO_PING_INTERVAL: process.env.VITE_APP_SOCKETIO_PING_INTERVAL || 25000,
  /** @see https://socket.io/docs/v4/server-options/#pingtimeout */
  VITE_APP_SOCKETIO_PING_TIMEOUT: process.env.VITE_APP_SOCKETIO_PING_TIMEOUT || 20000,
  VITE_APP_SOCKETIO_TRANSPORTS: process.env.VITE_APP_SOCKETIO_TRANSPORTS || 'websocket',
  VITE_APP_THEME: process.env.VITE_APP_THEME || 'system',
  VITE_APP_TITLE: process.env.VITE_APP_TITLE || 'Our Shopping List',
  VITE_APP_USE_ITEM_QUICK_SYNTAX: !!parseInt(process.env.VITE_APP_USE_ITEM_QUICK_SYNTAX),
}

export {
  config
};
