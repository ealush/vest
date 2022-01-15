const cleanupDistFiles = require('./cleanupDistFiles');

const exec = require('vx/exec');
const logger = require('vx/logger');
const opts = require('vx/opts');
const { usePackage, VX_PACKAGE_NAME } = require('vx/vxContext');
const vxPath = require('vx/vxPath');

function buildPackage({ options } = {}) {
  const name = usePackage();
  logger.info(`🛠 Building package: ${name}`);

  cleanupDistFiles(name);

  return Promise.all(
    [opts.format.ES, opts.format.UMD, opts.format.CJS].map(format => {
      return exec.async([
        `${VX_PACKAGE_NAME}=${name}`,
        `rollup -c`,
        vxPath.ROLLUP_CONFIG_PATH,
        options,
        `--format=${format}`,
      ]);
    })
  );
}

module.exports = buildPackage;
