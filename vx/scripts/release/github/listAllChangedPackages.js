const listAllChangesSinceStableBranch = require('./listAllChangesSinceStableBranch');

const packageNames = require('vx/packageNames');
const vxPath = require('vx/vxPath');

/**
 * Lists all packages that have changed since the stable branch.
 * @returns {Set<string>} Set of package names to release.
 */
function listAllChangedPackages() {
  const changes = listAllChangesSinceStableBranch();

  return changes.reduce((packages, { files = [] }) => {
    return files.reduce((packages, file) => {
      const packageName = vxPath.packageNameFromPath(file);
      if (!packageNames.names[packageName]) {
        return packages;
      }

      packages.add(packageName);

      return packages;
    }, packages);
  }, new Set());
}

module.exports = listAllChangedPackages;
