import * as logger from 'vx/logger.js';
import packagesToRelease from 'vx/scripts/release/packagesToRelease.js';
import releasePackage from 'vx/scripts/release/releasePackage.js';
import commitChangesToGit from 'vx/scripts/release/steps/commitChangesToGit.js';
import {
  isReleaseBranch,
  targetPackage,
  branchAllowsRelease,
  CURRENT_BRANCH,
} from 'vx/util/taggedBranch.js';
import { usePackage, withPackage } from 'vx/vxContext.js';

import 'vx/scripts/genTsConfig.js';

export type ReleaseOptions = { isTopLevelChange?: boolean };

export default async function release({
  isTopLevelChange,
}: ReleaseOptions = {}): Promise<void> {
  if (!branchAllowsRelease) {
    logger.info(`❌  Branch ${CURRENT_BRANCH} does not allow release. Exiting`);
    return;
  }

  const pkg = usePackage() || targetPackage;
  if (pkg) {
    return withPackage(pkg, () => releasePackage({ isTopLevelChange }));
  }
  await releaseAll();
}

async function releaseAll(): Promise<void> {
  logger.info('🏃 Running release script.');

  const { packageListToRelease, isTopLevelChange } = packagesToRelease();

  if (packageListToRelease.length === 0) {
    logger.info('📭 No packages to release. Skipping.');
    return;
  }

  for (const name of packageListToRelease) {
    await withPackage(name, () => release({ isTopLevelChange }));
  }

  if (!isReleaseBranch) {
    logger.info(`❌  Not in release branch. Not pushing changes to git.`);
    return;
  }

  await commitChangesToGit();
}
