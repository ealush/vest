const fs = require('fs');
const path = require('path');

const opts = require('vx/opts');
const vxPath = require('vx/vxPath');

/**
 * Reads and parses the repository root package.json.
 * @returns {Record<string, any>} Parsed root package.json content.
 */
function rootPackageJson() {
  // Manually reading it instead of requiring to avoid caching
  const jsonString = fs.readFileSync(
    path.join(vxPath.ROOT_PATH, opts.fileNames.PACKAGE_JSON),
    'utf8',
  );
  return JSON.parse(jsonString);
}

module.exports = rootPackageJson;
