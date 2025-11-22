import fs from 'fs';
import path from 'path';

import { fileNames } from '../opts.js';

import vxPath from 'vx/vxPath.js';

/**
 * Reads and parses the repository root package.json.
 * @returns {Record<string, any>} Parsed root package.json content.
 */
function rootPackageJson() {
  // Manually reading it instead of requiring to avoid caching
  const jsonString = fs.readFileSync(
    path.join(vxPath.ROOT_PATH, fileNames.PACKAGE_JSON),
    'utf8',
  );
  return JSON.parse(jsonString);
}

export default rootPackageJson;
