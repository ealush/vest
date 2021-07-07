const fs = require('fs');

const packageName = require('vx/packageName');
const vxPath = require('vx/vxPath');

function packageJson(pkgName = packageName()) {
  // Manually reading it instead of requiring to avoid caching
  const jsonString = fs.readFileSync(vxPath.packageJson(pkgName), 'utf8');
  return JSON.parse(jsonString);
}

module.exports = packageJson;
