const fs = require('fs-extra');

const { packageNames, packageDist, packageJson } = require('../util/');

const addEsmDir = require('./build/addEsmDir');
const buildPackage = require('./build/buildPackage');
const copyDistFiles = require('./build/copyDistFiles');
const updatePackageJson = require('./build/updatePackageJson');
const writeMainTemplate = require('./build/writeMainTemplate');

const buildOne = packageName => {
  if (!packageJson(packageName)?.scripts?.build) {
    return;
  }
  // Remove existing dist dir
  fs.removeSync(packageDist(packageName));
  fs.mkdirpSync(packageDist(packageName));

  // Build package
  buildPackage(packageName);

  // Add mjs exports directory
  addEsmDir(packageName);

  // Add a main export file for the package.
  writeMainTemplate(packageName);

  // Copy distribution files to root path
  copyDistFiles(packageName);

  // Add all exports to package.json
  updatePackageJson(packageName);
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
