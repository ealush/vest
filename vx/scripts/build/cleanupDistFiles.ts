import { createRequire } from 'module';
import path from 'path';

import fse from 'fs-extra';

import vxPath from 'vx/vxPath.js';

const require = createRequire(import.meta.url);
const glob: typeof import('glob') = require('glob');

/**
 * Removes generated dist files and extensionless exports for a package.
 */
export default function cleanupDistFiles(packageName: string): void {
  fse.removeSync(vxPath.packageDist(packageName));

  const exportNames = glob
    .sync(vxPath.packageSrcExports(packageName, '*.ts'))
    .map(f => path.basename(f, '.ts'));

  exportNames.forEach(exportName => {
    fse.removeSync(vxPath.package(packageName, exportName));
  });
}
