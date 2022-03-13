const {app} = require('./app');

app.use(function (err, req, res, next) {
  console.error('[500]', err.stack);
  res.status(500).json({
    error: err
  });
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
