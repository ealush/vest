import path from 'path';

import { glob } from 'glob';

import vxPath from 'vx/vxPath.js';

export type PackagePair = [string, string];

export const pairs: PackagePair[] = glob
  .sync(vxPath.package('*'))
  .reduce<PackagePair[]>((packages, packagePath) => {
    packages.push([path.basename(packagePath), packagePath]);
    return packages;
  }, []);

export const names = pairs.map(([name]) => name);
