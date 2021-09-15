const filterCommitByPackage = require('./filterCommitsByPackage');
const listAllChangesSinceStableBranch = require('./listAllChangesSinceStableBranch');

const { usePackage } = require('vx/vxContext');

// [{title: "...", files: ["..."]}] ...
function getDiff() {
  const allChanges = listAllChangesSinceStableBranch();
  return filterCommitByPackage(usePackage(), allChanges);
}

module.exports = getDiff;
