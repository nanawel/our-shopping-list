const express = require('express');

module.exports = function (app) {
  /** @see https://expressjs.com/en/4x/api.html#express.static */
  const opts = {
    maxAge: '30d',
    immutable: true
  }

  app.use(express.static('client/dist', opts));
};
