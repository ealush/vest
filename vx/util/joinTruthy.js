const concatTruthy = require('vx/util/concatTruthy');

module.exports = function joinTruthy(values, delimiter) {
  return concatTruthy(values).join(delimiter);
};
