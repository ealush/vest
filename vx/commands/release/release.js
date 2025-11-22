import packagesToRelease from '../../scripts/release/packagesToRelease.js';
import releasePackage from '../../scripts/release/releasePackage.js';
import commitChangesToGit from '../../scripts/release/steps/commitChangesToGit.js';
import {
  isReleaseBranch,
  targetPackage,
  branchAllowsRelease,
  CURRENT_BRANCH,
} from '../../util/taggedBranch.js';
import { usePackage, withPackage, ctx } from '../../vxContext.js';

import * as logger from 'vx/logger.js';
import '../../scripts/genTsConfig.js';

/**
 * Releases a specific package when scoped or the full set when not.
 * @param {{ isTopLevelChange?: boolean }} param0 Flag for workspace-level changes.
 */

export default function release({ isTopLevelChange }) {
  if (!branchAllowsRelease) {
    logger.info(`❌  Branch ${CURRENT_BRANCH} does not allow release. Exiting`);
    return;
  }

  const pkg = usePackage() || targetPackage;
  if (pkg) {
    return withPackage(pkg, () => releasePackage({ isTopLevelChange }));
  }
  releaseAll();
}

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
