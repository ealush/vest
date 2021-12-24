// const build = require('./../build/buildPackage');
const genDiffData = require('./genDiffData');
const getDiff = require('./github/getDiff');
const publishPackage = require('./steps/publishPackage');
const setNextVersion = require('./steps/setNextVersion');
// const updateChangelog = require('./steps/updateChangelog');
const updateLocalDepsToLatest = require('./steps/updateLocalDepsToLatest');

const logger = require('vx/logger');
const { usePackage } = require('vx/vxContext');

function releasePackage() {
  const pkgName = usePackage();

  logger.info(`Releasing package: 📦 ${pkgName}`);

  logger.info(`🔍 Finding diffs for package: ${pkgName}`);
  const changes = getDiff();

  if (!changes.length) {
    logger.info('🛌 No commits related to package. Exiting.');
    return;
  }

  const diffData = genDiffData(changes);

  logger.info('⚙️ Generated diff data:', JSON.stringify(diffData, null, 2));

  setNextVersion(diffData);

  updateLocalDepsToLatest();

  // At the moment we're building all packages in the integration.yml workflow.
  // This is because we don't install all packages, but some are linked so we don't
  // have their dist and type files. A possible solution might be to add the types
  // to the repo as well. Need to revisit this.
  // build();

  // updateChangelog(diffData);

  publishPackage(diffData);
}

module.exports = releasePackage;
