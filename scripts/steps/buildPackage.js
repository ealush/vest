const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { CONFIG_PATH } = require('../../config');
const { exec, logger } = require('../../util');

function buildPackage(packageName) {
  logger.info(`🛠 Building package: ${packageName}`);

  const buildConfigPath = path.resolve(CONFIG_PATH, 'builds');

  const rollupConfigs = glob.sync(`./${packageName}*.js`, {
    cwd: buildConfigPath,
    dot: false,
    absolute: true,
  });

  rollupConfigs.forEach(configPath => {
    if (!fs.existsSync(configPath)) {
      return;
    }

    exec(`rollup -c ${configPath}`);
  });
}

module.exports = buildPackage;
