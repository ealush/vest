import { createRequire } from 'module';
import path from 'path';

import { packageNames } from './packageNames.js';

import vxPath from 'vx/vxPath.js';

const require = createRequire(import.meta.url);
const glob = require('glob');

/**
 * @typedef {Record<string, string[]>} PackageExports
 */

/** @type {PackageExports} */
const packageExports = packageNames.list.reduce(
  (packageExports, packageName) =>
    Object.assign(packageExports, {
      [packageName]: glob
        .sync(vxPath.packageSrcExports(packageName, '*.ts'))
        .map(packageExport => path.basename(packageExport, '.ts')),
    }),
  {},
);

export default packageExports;
