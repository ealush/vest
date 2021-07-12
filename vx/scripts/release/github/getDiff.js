
const filterCommitByPackage = require('./filterCommitsByPackage');
const listAllChangesSinceStableBranch = require('./listAllChangesSinceStableBranch');

const packageName = require('vx/packageName');

// [{title: "...", files: ["..."]}] ...
function getDiff() {
  const allChanges = listAllChangesSinceStableBranch();
  return filterCommitByPackage(packageName(), allChanges);
}

module.exports = getDiff;
