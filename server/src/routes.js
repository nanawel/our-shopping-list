const mongoose = require('mongoose');
const {app} = require('./app');

app.use(function (err, req, res, next) {
  let httpStatus = err.status || 500;
  let body = {error: err};
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
