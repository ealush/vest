import fse from 'fs-extra';

import * as packageNames from '../../../packageNames.js';
import packageJson from '../../../util/packageJson.js';
import {
  isNextBranch,
  isIntegrationBranch,
  targetPackage,
} from '../../../util/taggedBranch.js';
import { TAG_NEXT, TAG_DEV } from '../releaseKeywords.js';

import * as logger from 'vx/logger.js';
import vxPath from 'vx/vxPath.js';

// eslint-disable-next-line complexity
/**
 * Aligns local workspace dependencies to the latest built versions based on branch rules.
 * @returns {void}
 */
export default function updateLocalDepsToLatest() {
  logger.log('Updating local dependencies to latest version');
  const pkgJson = packageJson();
  const deps = pkgJson.dependencies;

  if (!deps) {
    return;
  }

  Object.keys(packageNames.names).forEach(name => {
    if (!deps[name]) return;
    const depPkgJson = packageJson(name);
    if (depPkgJson && depPkgJson.name === name) {
      deps[name] = getDependencyVersion(depPkgJson, name);
    }
  });

  fse.writeJSONSync(vxPath.packageJson(), pkgJson, {
    spaces: 2,
  });
}

function getDependencyVersion(depPkgJson) {
  if (targetPackage) {
    return getTargetPackageVersion(depPkgJson);
  }
  return getDefaultPackageVersion(depPkgJson);
}

function getTargetPackageVersion(depPkgJson) {
  if (isNextBranch) {
    return TAG_NEXT;
  }
  if (isIntegrationBranch) {
    return TAG_DEV;
  }
  return depPkgJson.version;
}

function getDefaultPackageVersion(depPkgJson) {
  if (isNextBranch || isIntegrationBranch) {
    return depPkgJson.version;
  }
  return `^${depPkgJson.version}`;
}
