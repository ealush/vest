module.exports = function joinTruthy(values, delimiter) {
  return [].concat(values).filter(Boolean).join(delimiter);
};
