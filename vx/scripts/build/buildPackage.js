const cleanupDistFiles = require('./cleanupDistFiles');

const exec = require('vx/exec');
const logger = require('vx/logger');
const packageName = require('vx/packageName');
const vxPath = require('vx/vxPath');

function buildPackage({ options } = {}) {
  const name = packageName();
  logger.info(`🛠 Building package: ${name}`);

  cleanupDistFiles(name);

  exec([`rollup -c`, vxPath.ROLLUP_CONFIG_PATH, options]);
}

module.exports = buildPackage;
