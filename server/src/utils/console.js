const util = require('util');

module.exports = {
  json(...args) {
    console.log(JSON.stringify(args, null, 2))
  }
}
