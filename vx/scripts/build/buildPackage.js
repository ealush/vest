const exec = require('vx/exec');
const logger = require('vx/logger');
const opts = require('vx/opts');
const { usePackage } = require('vx/vxContext');
const vxPath = require('vx/vxPath');

const cleanupDistFiles = require('./cleanupDistFiles');

function buildPackage(options = {}) {
  const name = usePackage();
  logger.info(`🛠 Building package: ${name}`);

  cleanupDistFiles(name);
  process.env.VX_PACKAGE_NAME = name;
  process.env.VX_BUILD_SINGLE = !!options.buildSingle;

  const format = [];

  if (options.buildSingle) {
    format.push(opts.format.CJS);
  }

  exec([
    `rollup -c`,
    vxPath.ROLLUP_CONFIG_PATH,
    format.length && `--format=${format}`,
  ]);

  delete process.env.VX_PACKAGE_NAME;
  delete process.env.VX_BUILD_SINGLE;
}

module.exports = buildPackage;
