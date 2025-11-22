import path from 'path';

import { createPackageConfig } from './packageConfig.ts';

const packageDir = process.env.PACKAGE_DIR
  ? path.resolve(process.env.PACKAGE_DIR)
  : process.cwd();

export default createPackageConfig({ packageDir });
