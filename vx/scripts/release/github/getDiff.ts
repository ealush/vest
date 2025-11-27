import { dependsOn } from '../depsTree.js';

import listAllChangesSinceStableBranch from './listAllChangesSinceStableBranch.js';
import matchPackageNameInCommit from './matchPackageNameInCommit.js';

import { usePackage } from 'vx/vxContext.js';
import vxPath from 'vx/vxPath.js';

type CommitChange = { title: string; files: string[] };

// [{title: "...", files: ["..."]}] ...
function getDiff(packageName = usePackage()): {
  changesToPackage: CommitChange[];
  changedByDependency: boolean;
} {
  if (!packageName) {
    throw new Error('Package name is required to build diff data.');
  }

  const allChanges = listAllChangesSinceStableBranch();
  const changesToPackage = filterCommitByPackage(packageName, allChanges);
  const changedByDependency = didChangeByDependency(packageName, allChanges);

  return { changesToPackage, changedByDependency };
}

export default getDiff;

/**
 */
function filterCommitByPackage(
  packageName: string,
  commits: CommitChange[],
): CommitChange[] {
  return commits.filter(({ title, files }) => {
    if (title.match(matchPackageNameInCommit(packageName))) {
      return true;
    }

    return files.some(file => vxPath.packageNameFromPath(file) === packageName);
  });
}

/**
 */
function didChangeByDependency(
  packageName: string,
  commits: Array<{ files: string[] }>,
): boolean {
  return commits.some(({ files }) => {
    return files.some(file => {
      const changedPackage = vxPath.packageNameFromPath(file);

      return dependsOn(packageName, changedPackage);
    });
  });
}
