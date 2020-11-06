const { DIR_NAME_DIST } = require('./filePaths');
const packagePath = require('./packagePath');

function packageDist(packageName, ...args) {
  return packagePath(packageName, DIR_NAME_DIST, ...args);
}

module.exports = packageDist;
