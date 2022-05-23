const express = require('express');
const {VUE_APP_DISABLE_AGRESSIVE_ASSETS_CACHING} = require('../../config');

module.exports = function (app) {
  let opts = {};

  if (process.env.NODE_ENV === 'production'
    && !VUE_APP_DISABLE_AGRESSIVE_ASSETS_CACHING
  ) {
    /** @see https://expressjs.com/en/4x/api.html#express.static */
    opts = {
      maxAge: '30d',
      immutable: true
    };
  }

  app.use(express.static('client/dist', opts));
};
