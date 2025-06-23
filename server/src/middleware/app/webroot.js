// Handle custom BASE_URL transparently
// #58/GITHUB#18

const path = require('path');
const rewrite = require('express-urlrewrite');
const { config } = require('../../config');

const trimedWebRoot = path.normalize(`/${config.BASE_URL}`);
console.info(`Using web root: ${trimedWebRoot}`);

module.exports = function (app) {
  if (trimedWebRoot !== '') {
    // Prevent access to any URL not starting with the configured BASE_URL
    app.use(function (req, res, next) {
      if (!req.path.replace(new RegExp('^/+'), '/').startsWith(`${trimedWebRoot}`)) {
        console.error('[400]', 'Invalid incoming request URL:', `${req.method} ${req.path}`);
        res.status(400)
          .json({
            error: {
              message: 'Invalid path provided.'
            }
          })
          .end();
      } else {
        next();
      }
    });

    // Load express-urlrewrite
    app.use(rewrite(new RegExp(`^/*${trimedWebRoot}+(.*)`), '/$1'));

    // Override response.redirect() to preprend BASE_URL
    app.use(function (req, res, next) {
      const origRedirect = res.redirect;
      res.redirect = function (url) {
        /** @see node_modules/express/lib/response.js */
        var address = url;
        var status = 302;
        if (arguments.length === 2) {
          if (typeof arguments[0] === 'number') {
            status = arguments[0];
            address = arguments[1];
          } else {
            status = arguments[1];
          }
        }

        // Fix redirect path according to BASE_URL if needed
        if (!path.normalize(`/${address}/`).replace(/^\/+/, '').startsWith(trimedWebRoot)) {
          address = path.normalize(`${trimedWebRoot}${address}/`);
        }

        return origRedirect.apply(res, [status, address]);
      }
      next();
    });
  }
};
