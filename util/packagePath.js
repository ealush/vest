const path = require("path");
const { PACKAGES_PATH } = require("../config");

function packagePath(packageName, ...args) {
  return path.resolve(PACKAGES_PATH, packageName, ...args);
}

module.exports = packagePath;
