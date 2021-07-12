const fse = require('fs-extra');

const exec = require('vx/exec');
const logger = require('vx/logger');
const packageName = require('vx/packageName');
const vxPath = require('vx/vxPath');

function buildPackage(name = packageName(), { options } = {}) {
  logger.info(`🛠 Building package: ${name}`);

  fse.removeSync(vxPath.packageDist());

  exec([`rollup -c`, vxPath.ROLLUP_CONFIG_PATH, options]);
}

module.exports = buildPackage;
