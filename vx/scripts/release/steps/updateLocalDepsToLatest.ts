import fse from 'fs-extra';

import { TAG_NEXT, TAG_DEV } from '../releaseKeywords.js';

import * as logger from 'vx/logger.js';
import { packageNames } from 'vx/packageNames.js';
import packageJson from 'vx/util/packageJson.js';
import type { PackageJson } from 'vx/util/packageJson.js';
import {
  isNextBranch,
  isIntegrationBranch,
  targetPackage,
} from 'vx/util/taggedBranch.js';
import vxPath from 'vx/vxPath.js';

// eslint-disable-next-line complexity
/**
 * Aligns local workspace dependencies to the latest built versions based on branch rules.
 * @returns {void}
 */
export default function updateLocalDepsToLatest(): void {
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

function getDependencyVersion(depPkgJson: PackageJson, name: string): string {
  if (targetPackage) {
    return getTargetPackageVersion(depPkgJson);
  }
  return getDefaultPackageVersion(depPkgJson, name);
}

function getTargetPackageVersion(depPkgJson: PackageJson): string {
  if (isNextBranch) {
    return TAG_NEXT;
  }
  if (isIntegrationBranch) {
    return TAG_DEV;
  }
  return depPkgJson.version ?? TAG_DEV;
}

function getDefaultPackageVersion(
  depPkgJson: PackageJson,
  name: string,
): string {
  if (isNextBranch || isIntegrationBranch) {
    return depPkgJson.version ?? TAG_DEV;
  }
  const version = depPkgJson.version;
  if (!version) {
    throw new Error(`Missing version for dependency ${name}`);
  }
  return `^${version}`;
}
