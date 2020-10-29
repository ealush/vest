const { packageNames } = require('../util/');

const buildPackage = require('./build/buildPackage');
const copyDistFiles = require('./build/copyDistFiles');

const buildOne = packageName => {
  buildPackage(packageName);
  copyDistFiles(packageName);
};

const build = packageName => {
  require('./genJsconfig');

  if (packageName) {
    buildOne(packageName);
  } else {
    // Build each one, guaranteed to run vest last
    packageNames.ALL_PACKAGES.sort((a, b) =>
      b === packageNames.VEST ? -1 : 0
    ).forEach(buildOne);
  }
};

module.exports = build;
