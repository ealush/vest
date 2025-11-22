import { sortDependencies } from './scripts/release/depsTree.js';
import * as packageList from './util/packageList.js';
import { usePackage } from './vxContext.js';

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
