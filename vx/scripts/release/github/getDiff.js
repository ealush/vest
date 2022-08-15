const { usePackage } = require('vx/vxContext');

const filterCommitByPackage = require('./filterCommitsByPackage');
const listAllChangesSinceStableBranch = require('./listAllChangesSinceStableBranch');

// [{title: "...", files: ["..."]}] ...
function getDiff(packageName = usePackage()) {
  const allChanges = listAllChangesSinceStableBranch();
  return filterCommitByPackage(packageName, allChanges);
}

module.exports = getDiff;
