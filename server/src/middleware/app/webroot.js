// Handle custom BASE_URL transparently
// #58/GITHUB#18

const path = require('path');
const rewrite = require('express-urlrewrite');
const config = require('../../config');

const cleanedWebRoot = path.normalize(`/${config.BASE_URL}`)
  .replace(/\/+$/, ''); // Strip last slashes for the RegExp below
console.info(`Using web root: ${cleanedWebRoot}`);

module.exports = function (app) {
  if (cleanedWebRoot !== '') {
    app.use(rewrite(new RegExp(`^${cleanedWebRoot}/+(.*)`), '/$1'));
  }
};
