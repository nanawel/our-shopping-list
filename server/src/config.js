import path from 'path';

let config = {
  BASE_URL: path.normalize(process.env.BASE_URL || '')  // #58/GITHUB#18
    .replace(/^(\/|\s)+/, '')
    .replace(/(\/|\s)+$/, '')
    .concat('/'),
  DEBUG: process.env.DEBUG || '',
  VITE_APM_ENABLED: !!parseInt(process.env.VITE_APM_ENABLED),
  VITE_APM_LOGLEVEL: process.env.VITE_APM_LOGLEVEL || 'warn',
  VITE_APM_SERVERURL: process.env.VITE_APM_SERVERURL || '',
  VITE_APM_SERVERURLPREFIX: process.env.VITE_APM_SERVERURLPREFIX || '',
  VITE_APM_SERVICENAME: process.env.VITE_APM_SERVICENAME || '',
  VITE_BOARD_DELETION_ENABLED: !!parseInt(process.env.VITE_BOARD_DELETION_ENABLED),
  VITE_CHECKED_ITEMS_HISTORY_SORT_FIELD: process.env.VITE_CHECKED_ITEMS_HISTORY_SORT_FIELD || 'lastCheckedAt',
  VITE_CHECKED_ITEMS_HISTORY_SORT_ORDER: process.env.VITE_CHECKED_ITEMS_HISTORY_SORT_ORDER || 'desc',
  VITE_CLIENT_LOG_CONSOLE_ENABLED: !!parseInt(process.env.VITE_CLIENT_LOG_CONSOLE_ENABLED),
  VITE_CLIENT_LOG_ENABLED: !!parseInt(process.env.VITE_CLIENT_LOG_ENABLED),
  VITE_CLIENT_LOG_LEVEL: process.env.VITE_CLIENT_LOG_LEVEL || 'debug',
  VITE_DISABLE_AGRESSIVE_ASSETS_CACHING: !!parseInt(process.env.VITE_DISABLE_AGRESSIVE_ASSETS_CACHING),
  VITE_DISABLE_CONTEXTMENU: !!parseInt(process.env.VITE_DISABLE_CONTEXTMENU),
  VITE_EDIT_ITEM_ON_CREATE: !!parseInt(process.env.VITE_EDIT_ITEM_ON_CREATE),
  VITE_ENV: process.env.VITE_ENV || process.env.NODE_ENV || 'production',
  VITE_HOME_MESSAGE: process.env.VITE_HOME_MESSAGE || '',
  VITE_I18N_FALLBACK_LOCALE: process.env.VITE_I18N_FALLBACK_LOCALE || 'en',
  VITE_I18N_FORCE_LOCALE: !!parseInt(process.env.VITE_I18N_FORCE_LOCALE),
  VITE_I18N_LOCALE: process.env.VITE_I18N_LOCALE || 'en',
  VITE_LIST_ALL_BOARDS_ENABLED: !!parseInt(process.env.VITE_LIST_ALL_BOARDS_ENABLED),
  VITE_LOCALSTORAGE_KEY_PREFIX: process.env.VITE_LOCALSTORAGE_KEY_PREFIX || 'OurShoppingList_',
  VITE_SHORT_TITLE: process.env.VITE_SHORT_TITLE || 'OSL',
  VITE_SINGLEBOARD_ID: process.env.VITE_SINGLEBOARD_ID || '00000000-0000-0000-0000-000000000000',
  VITE_SINGLEBOARD_MODE: !!parseInt(process.env.VITE_SINGLEBOARD_MODE),
  VITE_SINGLEBOARD_SLUG: process.env.VITE_SINGLEBOARD_SLUG || '_',
  /** @see https://socket.io/docs/v4/server-options/#connectionstaterecovery */
  VITE_SOCKETIO_CSR_MAXDISCONNECTIONDURATION: process.env.VITE_SOCKETIO_CSR_MAXDISCONNECTIONDURATION || (30 * 60 * 1000),
  /** @see https://socket.io/docs/v4/server-options/#pinginterval */
  VITE_SOCKETIO_PING_INTERVAL: process.env.VITE_SOCKETIO_PING_INTERVAL || 25000,
  /** @see https://socket.io/docs/v4/server-options/#pingtimeout */
  VITE_SOCKETIO_PING_TIMEOUT: process.env.VITE_SOCKETIO_PING_TIMEOUT || 20000,
  VITE_SOCKETIO_TRANSPORTS: process.env.VITE_SOCKETIO_TRANSPORTS || 'websocket',
  VITE_TITLE: process.env.VITE_TITLE || 'Our Shopping List',
  VITE_USE_ITEM_QUICK_SYNTAX: !!parseInt(process.env.VITE_USE_ITEM_QUICK_SYNTAX),
}

export {
  config
};
