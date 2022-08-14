const packageNames = require('vx/packageNames');
const vxPath = require('vx/vxPath');

const listAllChangesSinceStableBranch = require('./listAllChangesSinceStableBranch');

function listAllChangedPackages() {
  const changes = listAllChangesSinceStableBranch();
  return Object.keys(
    changes.reduce((packages, { files = [] }) => {
      return files.reduce((packages, file) => {
        const packageName = vxPath.packageNameFromPath(file);
        if (!packageNames.names[packageName]) {
          return packages;
        }
        packages[packageName] = packages[packageName] || true;

        return packages;
      }, packages);
    }, {})
  );
}

module.exports = listAllChangedPackages;
