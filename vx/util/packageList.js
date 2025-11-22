import path from 'path';

import { glob } from 'glob';

import vxPath from 'vx/vxPath.js';

// Unordered list of package names
/** @type {Array<[string, string]>} */
export const pairs = glob
  .sync(vxPath.package('*'))
  .reduce((packages, packagePath) => {
    packages.push([path.basename(packagePath), packagePath]);
    return packages;
  }, []);

/** @type {string[]} */
export const names = pairs.map(([name]) => name);
