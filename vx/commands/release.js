const commitChangesToGit = require('../scripts/release/steps/commitChangesToGit');

const logger = require('vx/logger');
const packagesToRelease = require('vx/scripts/release/packagesToRelease');
const releasePackage = require('vx/scripts/release/releasePackage');
const { isReleaseBranch } = require('vx/util/taggedBranch');
const {
  targetPackage,
  branchAllowsRelease,
  CURRENT_BRANCH,
} = require('vx/util/taggedBranch');
const { usePackage } = require('vx/vxContext');
const ctx = require('vx/vxContext');
require('../scripts/genTsConfig');

function release() {
  if (!branchAllowsRelease) {
    logger.info(`❌  Branch ${CURRENT_BRANCH} does not allow release. Exiting`);
    return;
  }

  const pkg = usePackage() || targetPackage;
  if (pkg) {
    return ctx.withPackage(pkg, releasePackage);
  } else {
    releaseAll();
  }
}

module.exports = release;

async function releaseAll() {
  logger.info('🏃 Running release script.');

  const releaseList = await packagesToRelease();

  releaseList.forEach(name => {
    ctx.withPackage(name, release);
  });

  if (!isReleaseBranch) {
    logger.info(`❌  Not in release branch. Not pushing changes to git.`);
    return;
  }

  commitChangesToGit();
}
