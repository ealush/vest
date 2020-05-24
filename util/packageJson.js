const packagePath = require('./packagePath');

function packageJson(packageName) {
  return require(packagePath(packageName, 'package.json'));
}

module.exports = packageJson;
