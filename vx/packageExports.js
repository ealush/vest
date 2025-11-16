const path = require('path');

const glob = require('glob');

const packageNames = require('vx/packageNames');
const vxPath = require('vx/vxPath');

/**
 * @typedef {Record<string, string[]>} PackageExports
 */

/** @type {PackageExports} */
module.exports = packageNames.list.reduce(
  (packageExports, packageName) =>
    Object.assign(packageExports, {
      [packageName]: glob
        .sync(vxPath.packageSrcExports(packageName, '*.ts'))
        .map(packageExport => path.basename(packageExport, '.ts')),
    }),
  {},
);
