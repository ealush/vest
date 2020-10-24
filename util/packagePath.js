const path = require('path');

const { PACKAGES_PATH } = require('./filePaths');

function packagePath(packageName, ...args) {
  return path.resolve(PACKAGES_PATH, packageName, ...args);
}

module.exports = packagePath;
