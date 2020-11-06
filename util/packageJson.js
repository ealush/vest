const packagePath = require('./packagePath');

function packageJSONPath(packageName) {
  return packagePath(packageName, 'package.json');
}

function packageJson(packageName) {
  return require(packageJSONPath(packageName));
}

packageJson.path = packageJSONPath;

module.exports = packageJson;
