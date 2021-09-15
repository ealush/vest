const fs = require('fs');

const { usePackage } = require('vx/vxContext');
const vxPath = require('vx/vxPath');

function packageJson(pkgName = usePackage()) {
  // Manually reading it instead of requiring to avoid caching
  const jsonString = fs.readFileSync(vxPath.packageJson(pkgName), 'utf8');
  return JSON.parse(jsonString);
}

module.exports = packageJson;
