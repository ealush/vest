const concatTruthy = require('./concatTruthy');

module.exports = function joinTruthy(values, delimiter) {
  return concatTruthy(values).join(delimiter);
};
