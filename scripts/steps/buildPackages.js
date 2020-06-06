const fs = require('fs');
const path = require('path');
const { CONFIG_PATH } = require('../../config');
const { exec, logger } = require('../../util');

function buildPackages() {
  logger.info('🛠 Building packages.');

  const buildConfigPath = path.resolve(CONFIG_PATH, 'builds', 'index.js');

  if (!fs.existsSync(buildConfigPath)) {
    return;
  }
  exec(`rollup -c ${buildConfigPath}`);
}

module.exports = buildPackages;
