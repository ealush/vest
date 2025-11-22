import fs from 'fs';

import { usePackage } from '../vxContext.js';

import vxPath from 'vx/vxPath.js';

/**
 * Reads and parses a package.json file for the requested package.
 * @param {string} [pkgName] Package name; defaults to current vx context.
 * @returns {Record<string, any>} Parsed package.json contents.
 */

export default function packageJson(pkgName = usePackage()) {
  // Manually reading it instead of requiring to avoid caching
  const jsonString = fs.readFileSync(vxPath.packageJson(pkgName), 'utf8');
  return JSON.parse(jsonString);
}

/**
 * Returns the `vxAllowResolve` configuration for the package.
 * @param {string} [pkgName] Package name; defaults to current vx context.
 * @returns {string[]} Allowed module specifiers.
 */

export function getVxAllowResolve(pkgName = usePackage()) {
  return packageJson(pkgName).vxAllowResolve || [];
}
