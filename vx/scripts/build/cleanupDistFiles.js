import { createRequire } from 'module';
import path from 'path';

import fse from 'fs-extra';

import vxPath from 'vx/vxPath.js';

const require = createRequire(import.meta.url);
const glob = require('glob');

/**
 * Removes generated dist files and extensionless exports for a package.
 * @param {string} packageName Package to clean.
 */
export default function cleanupDistFiles(packageName) {
  fse.removeSync(vxPath.packageDist(packageName));

  const exportNames = glob
    .sync(vxPath.packageSrcExports(packageName, '*.ts'))
    .map(f => path.basename(f, '.ts'));

  exportNames.forEach(exportName => {
    fse.removeSync(vxPath.package(packageName, exportName));
  });
}
