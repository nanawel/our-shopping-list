/*
 * Our Shopping List Server
 */

require('dotenv').config();

const LISTEN_PORT  = process.env.LISTEN_PORT || 8080;

const {httpServer} = require('./src/app');

// ============================================================================
// WEBSOCKET
// ============================================================================

require('./src/ws');

// ============================================================================
// ROUTES
// ============================================================================

require('./src/board/routes');
require('./src/list/routes');
require('./src/item/routes');

require('./src/healthcheck/routes');

// General and error handling routes
require('./src/routes');

// ============================================================================
// OBSERVERS
// ============================================================================

require('./src/board/observer');
require('./src/list/observer');

// ============================================================================
// START SERVER
// ============================================================================

const worker = httpServer.listen(LISTEN_PORT, () => {
  console.info(`OSL Server started on [${worker.address().address}]:${worker.address().port}`);
  console.info('Current environment:', process.env);
});
