const { exec, logger, packagePath } = require('../../util');

function buildPackage(packageName) {
  logger.info(`🛠 Building package: ${packageName}`);

  exec(`yarn --cwd ${packagePath(packageName)} build`);
}

module.exports = buildPackage;
