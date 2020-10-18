const { PACKAGE_NAMES } = require('../config');
const { PACKAGE_VEST } = require('../shared/constants');
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
    // Build each one, guaranteed to run vest last
    PACKAGE_NAMES.sort((a, b) => (b === PACKAGE_VEST ? -1 : 0)).forEach(
      buildOne
    );
  }
};

module.exports = build;
