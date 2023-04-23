const build = require('./../build/buildPackage');
const genDiffData = require('./genDiffData');
const getDiff = require('./github/getDiff');
const publishPackage = require('./steps/publishPackage');
const setNextVersion = require('./steps/setNextVersion');
// const updateChangelog = require('./steps/updateChangelog');
const updateLocalDepsToLatest = require('./steps/updateLocalDepsToLatest');

const logger = require('vx/logger');
const { usePackage } = require('vx/vxContext');

function releasePackage({ isTopLevelChange }) {
  const pkgName = usePackage();

  logger.info(`Releasing package: 📦 ${pkgName}`);

  logger.info(`🔍 Finding diffs for package: ${pkgName}`);
  const { changesToPackage, changedByDependency } = getDiff(pkgName);

  if (!changedByDependency && !changesToPackage.length && !isTopLevelChange) {
    logger.info('🛌 No Changes related to current package. Exiting.');
    return;
  }

  const diffData = genDiffData(changesToPackage);

  logger.info('⚙️ Generated diff data:', JSON.stringify(diffData, null, 2));

  setNextVersion(diffData);

  updateLocalDepsToLatest();

  build();

  // updateChangelog(diffData);

  publishPackage(diffData);
}

module.exports = releasePackage;
