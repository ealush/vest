const { usePackage } = require('vx/vxContext');
const vxPath = require('vx/vxPath');

const { dependsOn } = require('../depsTree');

const listAllChangesSinceStableBranch = require('./listAllChangesSinceStableBranch');
const matchPackageNameInCommit = require('./matchPackageNameInCommit');

// [{title: "...", files: ["..."]}] ...
function getDiff(packageName = usePackage()) {
  const allChanges = listAllChangesSinceStableBranch();
  const changesToPackage = filterCommitByPackage(packageName, allChanges);
  const changedByDependency = didChangeByDependency(packageName, allChanges);

  return { changesToPackage, changedByDependency };
}

module.exports = getDiff;

function filterCommitByPackage(packageName, commits) {
  return commits.filter(({ title, files }) => {
    if (title.match(matchPackageNameInCommit(packageName))) {
      return true;
    }

    return files.some(file => vxPath.packageNameFromPath(file) === packageName);
  });
}

function didChangeByDependency(packageName, commits) {
  return commits.some(({ files }) => {
    return files.some(file => {
      const changedPackage = vxPath.packageNameFromPath(file);

      return dependsOn(packageName, changedPackage);
    });
  });
}
