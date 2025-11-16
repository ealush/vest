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

/**
 * Releases a specific package when scoped or the full set when not.
 * @param {{ isTopLevelChange?: boolean }} param0 Flag for workspace-level changes.
 */
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

/**
 * Releases all packages in dependency order.
 */
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
