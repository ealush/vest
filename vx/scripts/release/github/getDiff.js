const { dependsOn } = require('../depsTree');

const listAllChangesSinceStableBranch = require('./listAllChangesSinceStableBranch');
const matchPackageNameInCommit = require('./matchPackageNameInCommit');

const { usePackage } = require('vx/vxContext');
const vxPath = require('vx/vxPath');

// [{title: "...", files: ["..."]}] ...
/**
 * Returns commits that impact a package and whether dependency changes affected it.
 * @param {string} [packageName=usePackage()] Package name to check.
 * @returns {{ changesToPackage: { title: string, files: string[] }[], changedByDependency: boolean }}
 */
function getDiff(packageName = usePackage()) {
  const allChanges = listAllChangesSinceStableBranch();
  const changesToPackage = filterCommitByPackage(packageName, allChanges);
  const changedByDependency = didChangeByDependency(packageName, allChanges);

  return { changesToPackage, changedByDependency };
}

module.exports = getDiff;

/**
 * Filters commit list to only those that reference the package.
 * @param {string} packageName Package to match.
 * @param {{ title: string, files: string[] }[]} commits Commits to filter.
 * @returns {{ title: string, files: string[] }[]}
 */
function filterCommitByPackage(packageName, commits) {
  return commits.filter(({ title, files }) => {
    if (title.match(matchPackageNameInCommit(packageName))) {
      return true;
    }

    return files.some(file => vxPath.packageNameFromPath(file) === packageName);
  });
}

/**
 * Determines if any dependency change affected the package.
 * @param {string} packageName Package to check.
 * @param {{ files: string[] }[]} commits Commit list.
 * @returns {boolean}
 */
function didChangeByDependency(packageName, commits) {
  return commits.some(({ files }) => {
    return files.some(file => {
      const changedPackage = vxPath.packageNameFromPath(file);

      return dependsOn(packageName, changedPackage);
    });
  });
}
