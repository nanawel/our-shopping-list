const express = require('express');
const {VITE_DISABLE_AGRESSIVE_ASSETS_CACHING} = require('../../config');

module.exports = function (app) {
  let opts = {};

  if (process.env.APP_ENV === 'production'
    && !VITE_DISABLE_AGRESSIVE_ASSETS_CACHING
  ) {
    /** @see https://expressjs.com/en/4x/api.html#express.static */
    opts = {
      maxAge: '30d',
      immutable: true
    };
  }

  app.use(express.static('client/dist', opts));
};
