import listAllChangesSinceStableBranch from './listAllChangesSinceStableBranch.js';

import * as packageNames from 'vx/packageNames.js';
import vxPath from 'vx/vxPath.js';

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

export default listAllChangedPackages;
