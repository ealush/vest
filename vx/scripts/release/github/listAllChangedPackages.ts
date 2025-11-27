import listAllChangesSinceStableBranch from './listAllChangesSinceStableBranch.js';

import { packageNames } from 'vx/packageNames.js';
import vxPath from 'vx/vxPath.js';

type CommitChange = { title: string; files: string[] };

function listAllChangedPackages(): Set<string> {
  const changes = listAllChangesSinceStableBranch();

  return changes.reduce<Set<string>>((packages, { files = [] }) => {
    return files.reduce<Set<string>>((innerPackages, file) => {
      const packageName = vxPath.packageNameFromPath(file);
      if (!packageNames.names[packageName]) {
        return innerPackages;
      }

      innerPackages.add(packageName);

      return innerPackages;
    }, packages);
  }, new Set<string>());
}

export default listAllChangedPackages;
