const packageName = require('vx/packageName');

const filterCommitByPackage = require('./filterCommitsByPackage');
const listAllChangesSinceStableBranch = require('./listAllChangesSinceStableBranch');

// [{title: "...", files: ["..."]}] ...
function getDiff() {
  const allChanges = listAllChangesSinceStableBranch();
  return filterCommitByPackage(packageName(), allChanges);
}

module.exports = getDiff;
