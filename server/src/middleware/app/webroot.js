// Handle custom BASE_URL transparently
// #58/GITHUB#18

const rewrite = require('express-urlrewrite');
const config = require('../../config');

const cleanedWebRoot = config.BASE_URL
  .replace(/^(\/|\s)+/, '')
  .replace(/(\/|\s)+$/, '');
if (cleanedWebRoot !== '') {
  console.info(`Using web root: ${cleanedWebRoot}`);
}

module.exports = function (app) {
  if (cleanedWebRoot !== '') {
    app.use(rewrite(new RegExp(`^/+${cleanedWebRoot}/+(.*)`), '/$1'));
  }
};
