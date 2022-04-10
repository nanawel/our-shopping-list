const util = require('util');

module.exports = {
  dump(...args) {
    console.log(util.inspect(args, { maxArrayLength: null }))
  }
}
