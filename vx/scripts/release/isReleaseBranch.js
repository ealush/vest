const { CURRENT_BRANCH, RELEASE_BRANCH } = process.env;

module.exports = function () {
  return CURRENT_BRANCH === RELEASE_BRANCH;
};
