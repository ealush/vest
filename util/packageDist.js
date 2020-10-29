const { DIR_NAME_DIST } = require('./filePaths');
const packagePath = require('./packagePath');

function packageDist(packageName) {
  return packagePath(packageName, DIR_NAME_DIST);
}

module.exports = packageDist;
