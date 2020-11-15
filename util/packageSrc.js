const { DIR_NAME_SRC } = require('./filePaths');
const packagePath = require('./packagePath');

function packageSrc(packageName, ...args) {
  return packagePath(packageName, DIR_NAME_SRC, ...args);
}

module.exports = packageSrc;
