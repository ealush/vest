/**
 * Builds a regex that matches a package name within commit messages.
 * @param {string} name Package name.
 * @returns {RegExp}
 */
module.exports = function matchPackageNameInCommit(name) {
  return new RegExp(`\\[${name}\\]|\\(${name}\\)`, 'i');
};
