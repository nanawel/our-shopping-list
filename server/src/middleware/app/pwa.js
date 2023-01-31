const fs = require('fs');
const config = require('../../config');

module.exports = function (app) {
  /**
   * Dynamic PWA manifest (GITHUB#4)
   */
  app.use((req, res, next) => {
    if (req.method === 'GET' && req.url === '/manifest.json') {
      try {
        const manifestContent = JSON.parse(fs.readFileSync('client/dist/manifest.json'));
        if (config.VUE_APP_TITLE) {
          manifestContent.name = config.VUE_APP_TITLE;
        }
        if (config.VUE_APP_SHORT_TITLE) {
          manifestContent.short_name = config.VUE_APP_SHORT_TITLE;
        }
        res.set('Cache-Control', 'max-age=86400')
          .json(manifestContent)
          .end();
      } catch (e) {
        console.error('PWA MIDDLEWARE ERROR:', e);
        next();
      }
    } else {
      next();
    }
  });
};
