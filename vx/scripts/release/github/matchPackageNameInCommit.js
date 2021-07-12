module.exports = function matchPackageNameInCommit(name) {
  return new RegExp(`\\[${name}\\]|\\(${name}\\)`, 'i');
};
