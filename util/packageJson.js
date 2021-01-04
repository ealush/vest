const fs = require('fs');

const packagePath = require('./packagePath');

function packageJSONPath(packageName) {
  return packagePath(packageName, 'package.json');
}

function packageJson(packageName) {
  const jsonString = fs.readFileSync(packageJSONPath(packageName), 'utf8');
  return JSON.parse(jsonString);
}

packageJson.path = packageJSONPath;

module.exports = packageJson;
