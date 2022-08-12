const { usePackage } = require('vx/vxContext');

const filterCommitByPackage = require('./filterCommitsByPackage');
const listAllChangesSinceStableBranch = require('./listAllChangesSinceStableBranch');

// [{title: "...", files: ["..."]}] ...
function getDiff() {
  const allChanges = listAllChangesSinceStableBranch();
  return filterCommitByPackage(usePackage(), allChanges);
}

module.exports = getDiff;
