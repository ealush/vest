const { PACKAGE_NAMES } = require('../config');
const buildPackage = require('./steps/buildPackage');
const copyDistFiles = require('./steps/copyDistFiles');

const buildOne = packageName => {
  buildPackage(packageName);
  copyDistFiles(packageName);
};

const build = packageName => {
  if (packageName) {
    buildOne(packageName);
  } else {
    PACKAGE_NAMES.forEach(buildOne);
  }
};

module.exports = build;
