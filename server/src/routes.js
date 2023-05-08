const mongoose = require('mongoose');
const {app} = require('./app');
const config = require('./config');
const fs = require('fs');

/**
 * Client config at runtime
 */
app.get('/config.js', (req, res) => {
  res.type('application/javascript')
    .set('Cache-Control', 'must-revalidate')
    .send('Object.assign(window, ' + JSON.stringify(config) + ');')
    .end();
});

/**
 * Default robots.txt handler
 */
app.get('/robots.txt', (req, res) => {
  res.type('text/plain')
    .set('Cache-Control', 'must-revalidate');

  if (fs.existsSync('./robots.txt')) {
    res.send(fs.readFileSync('./robots.txt'));
  } else {
    res.send('User-agent: *\n'
      + 'Disallow: /');
  }
  res.end();
});

/**
 * Error handling
 */
app.use(function (err, req, res, next) {
  let httpStatus = err.code || 500;
  let body = {error: err.stack};
  switch (true) {
    case err instanceof mongoose.Error.ValidationError:
      httpStatus = 400;
      break;

    // There might be some more errors handled in the future
  }

  console.error(`[${httpStatus}]`, err.stack);
  res.status(httpStatus)
    .json(body);
});
app.use(function (req, res, next) {
  console.error('[404]', `${req.method} ${req.path}`);
  res.status(404)
    .json({
      error: {
        message: `Invalid request: ${req.method} ${req.path}`
      }
    });
});
