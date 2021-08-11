const build = require('./../build/buildPackage');
const genDiffData = require('./../release/genDiffData');
const getDiff = require('./../release/github/getDiff');
const publishPackage = require('./../release/steps/publishPackage');
const setNextVersion = require('./../release/steps/setNextVersion');
const updateChangelog = require('./../release/steps/updateChangelog');

const logger = require('vx/logger');
const packageName = require('vx/packageName');

function releasePackage() {
  const pkgName = packageName();

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

  build();

  updateChangelog(diffData);

  publishPackage(diffData);
}

module.exports = releasePackage;
