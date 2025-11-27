import { createRequire } from 'module';
import path from 'path';

import { packageNames } from 'vx/packageNames.js';
import vxPath from 'vx/vxPath.js';

const require = createRequire(import.meta.url);
const glob: typeof import('glob') = require('glob');

export type PackageExports = Record<string, string[]>;

const packageExports: PackageExports = packageNames.list.reduce<PackageExports>(
  (exportsMap, packageName) => {
    exportsMap[packageName] = glob
      .sync(vxPath.packageSrcExports(packageName, '*.ts'))
      .map(packageExport => path.basename(packageExport, '.ts'));
    return exportsMap;
  },
  {},
);

export default packageExports;
