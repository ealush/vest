import { sortDependencies } from 'vx/scripts/release/depsTree.js';
import * as packageList from 'vx/util/packageList.js';
import { usePackage } from 'vx/vxContext.js';

export type PackageNames = {
  paths: Record<string, string>;
  list: string[];
  names: Record<string, string>;
  readonly current?: string;
};

const base: Omit<PackageNames, 'current'> = {
  paths: {},
  list: [],
  names: {},
};

export const packageNames: PackageNames = Object.defineProperty(
  base,
  'current',
  {
    get: (): string | undefined => usePackage(),
  },
) as PackageNames;

packageList.pairs.forEach(([name, path]) => {
  packageNames.paths[name] = path;
  packageNames.names[name] = name;
});

packageNames.list = sortDependencies(packageList.names);
