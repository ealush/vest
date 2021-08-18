const cleanupDistFiles = require('./cleanupDistFiles');

const exec = require('vx/exec');
const logger = require('vx/logger');
const packageName = require('vx/packageName');
const vxPath = require('vx/vxPath');

function buildPackage({ options } = {}) {
  const name = packageName();
  logger.info(`🛠 Building package: ${name}`);

  cleanupDistFiles(name);

  process.env.VX_PACKAGE_NAME = name;
  exec([`rollup -c`, vxPath.ROLLUP_CONFIG_PATH, options]);
  delete process.env.VX_PACKAGE_NAME;
}

module.exports = buildPackage;
