const rewrite = require('express-urlrewrite');
const config = require('../../config');

const cleanedWebRoot = config.NODE_WEB_ROOT
  .replace(/^(\/|\s)+/, '')
  .replace(/(\/|\s)+$/, '');
if (cleanedWebRoot !== '') {
  console.info(`Using web root: ${cleanedWebRoot}`);
}

module.exports = function (app) {
  if (cleanedWebRoot !== '') {
    app.use(rewrite(`/${cleanedWebRoot}/*`, '/$1'));
  }
};
