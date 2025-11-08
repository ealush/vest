const logger = require('vx/logger');
const packagesToRelease = require('vx/scripts/release/packagesToRelease');
const releasePackage = require('vx/scripts/release/releasePackage');
const commitChangesToGit = require('vx/scripts/release/steps/commitChangesToGit');
const { isReleaseBranch } = require('vx/util/taggedBranch');
const {
  targetPackage,
  branchAllowsRelease,
  CURRENT_BRANCH,
} = require('vx/util/taggedBranch');
const { usePackage } = require('vx/vxContext');
const ctx = require('vx/vxContext');

require('vx/scripts/genTsConfig');

function release({ isTopLevelChange }) {
  if (!branchAllowsRelease) {
    logger.info(`❌  Branch ${CURRENT_BRANCH} does not allow release. Exiting`);
    return;
  }

  const pkg = usePackage() || targetPackage;
  if (pkg) {
    return ctx.withPackage(pkg, () => releasePackage({ isTopLevelChange }));
  }
  releaseAll();
}

module.exports = release;

function releaseAll() {
  logger.info('🏃 Running release script.');

  const { packageListToRelease, isTopLevelChange } = packagesToRelease();

  packageListToRelease.forEach(name => {
    ctx.withPackage(name, () => release({ isTopLevelChange }));
  });

  if (!isReleaseBranch) {
    logger.info(`❌  Not in release branch. Not pushing changes to git.`);
    return;
  }

  commitChangesToGit();
}
