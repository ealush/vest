module.exports = function concatTruthy(...values) {
  return [].concat(...values).filter(Boolean);
};
