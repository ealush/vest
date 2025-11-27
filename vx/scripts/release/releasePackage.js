import build from '../build/buildPackage.js';

import genDiffData from './genDiffData.js';
import getDiff from './github/getDiff.js';
import publishPackage from './steps/publishPackage.js';
import setNextVersion from './steps/setNextVersion.js';
// import updateChangelog from './steps/updateChangelog.js';
import updateLocalDepsToLatest from './steps/updateLocalDepsToLatest.js';

import * as logger from 'vx/logger.js';
import { usePackage } from 'vx/vxContext.js';

/**
 * Releases the currently scoped package, performing build and publish steps.
 * @param {{ isTopLevelChange?: boolean }} param0 Flag indicating workspace-level changes.
 */
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

export default releasePackage;
