import { sortDependencies } from 'vx/scripts/release/depsTree.js';
import * as packageList from 'vx/util/packageList.js';
import { usePackage } from 'vx/vxContext.js';

/**
 * @typedef {{ paths: Record<string, string>, list: string[], names: Record<string, string>, current?: string }} PackageNames
 */

/** @type {PackageNames} */
export const packageNames = Object.defineProperty(
  { paths: {}, list: [], names: {} },
  'current',
  {
    get: () => {
      return usePackage();
    },
  },
);

packageList.pairs.forEach(([name, path]) => {
  packageNames.paths[name] = path;
  packageNames.names[name] = name;
});

packageNames.list = sortDependencies(packageList.names);
