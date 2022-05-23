const util = require('util');

module.exports = {
  json(...args) {
    console.log(JSON.stringify(
      args.length > 1 ? args : args[0],
      null,
      2
    ))
  }
}
