import fs from 'fs';
import path from 'path';

import type { PackageJson } from './packageJson.js';

import { fileNames } from 'vx/opts.js';
import vxPath from 'vx/vxPath.js';

function rootPackageJson(): PackageJson {
  // Manually reading it instead of requiring to avoid caching
  const jsonString = fs.readFileSync(
    path.join(vxPath.ROOT_PATH, fileNames.PACKAGE_JSON),
    'utf8',
  );
  return JSON.parse(jsonString) as PackageJson;
}

export default rootPackageJson;
