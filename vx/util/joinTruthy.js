const concatTruthy = require('vx/util/concatTruthy');

/**
 * Joins truthy string-like values with the provided delimiter.
 * @param {(Array<string | false | null | undefined | (string | false | null | undefined)[]>)} values Values to join; nested arrays are flattened.
 * @param {string} delimiter Delimiter to place between values.
 * @returns {string} Concatenated string of all truthy values.
 */
module.exports = function joinTruthy(values, delimiter) {
  return concatTruthy(values).join(delimiter);
};
