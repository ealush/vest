const fse = require('fs-extra');

const writeMainTemplate = require('./writeMainTemplate');

const exec = require('vx/exec');
const logger = require('vx/logger');
const packageName = require('vx/packageName');
const vxPath = require('vx/vxPath');

function buildPackage(name = packageName(), { watch } = {}) {
  logger.info(`🛠 Building package: ${name}`);

  fse.removeSync(vxPath.packageDist());

  exec([`rollup -c`, vxPath.ROLLUP_CONFIG_PATH, watch && '--watch']);

  writeMainTemplate(packageName(), vxPath.packageDist(packageName()));
}

module.exports = buildPackage;
