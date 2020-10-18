const packagePath = require('./packagePath');

function packageDist(packageName) {
  return packagePath(packageName, 'dist');
}

module.exports = packageDist;
