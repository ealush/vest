const cleanupDistFiles = require('./cleanupDistFiles');

const exec = require('vx/exec');
const logger = require('vx/logger');
const opts = require('vx/opts');
const { usePackage } = require('vx/vxContext');
const vxPath = require('vx/vxPath');

function buildPackage(options = {}) {
  const name = usePackage();
  logger.info(`🛠 Building package: ${name}`);

  cleanupDistFiles(name);
  process.env.VX_PACKAGE_NAME = name;
  process.env.VX_BUILD_SINGLE = !!options.SINGLE;

  let builds;

  if (options.SINGLE) {
    builds = [opts.format.CJS];
  } else {
    builds = [opts.format.ES, opts.format.UMD, opts.format.CJS];
  }

  builds.forEach(format => {
    exec([`rollup -c`, vxPath.ROLLUP_CONFIG_PATH, `--format=${format}`]);
  });
  delete process.env.VX_PACKAGE_NAME;
  delete process.env.VX_BUILD_SINGLE;
}

module.exports = buildPackage;
