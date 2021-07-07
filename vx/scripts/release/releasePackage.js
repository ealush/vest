const packageName = require('vx/packageName');

const build = require('./../build/buildPackage');
const genDiffData = require('./../release/genDiffData');
const getDiff = require('./../release/github/getDiff');
const copyDist = require('./../release/steps/copyDist');
const publishPackage = require('./../release/steps/publishPackage');
const setNextVersion = require('./../release/steps/setNextVersion');
const updateChangelog = require('./../release/steps/updateChangelog');

const logger = require('vx/logger');

function releasePackage() {
  logger.info(`Releasing package: 📦 ${packageName()}`);

  logger.info(`🔍 Finding diffs for package: ${packageName()}`);
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

  copyDist();
}

module.exports = releasePackage;
