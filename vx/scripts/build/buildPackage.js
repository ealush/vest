const cleanupDistFiles = require('./cleanupDistFiles');

const exec = require('vx/exec');
const logger = require('vx/logger');
const { usePackage } = require('vx/vxContext');
const vxPath = require('vx/vxPath');

/**
 * Builds the currently scoped package with tsdown.
 * @param {{ cliOptions?: string }} [options] Optional CLI options appended to tsdown.
 */
function buildPackage(options = {}) {
  const name = usePackage();
  logger.info(`🛠 Building package: ${name}`);

  cleanupDistFiles(name);

  const packageDir = vxPath.package(name);
  const prevEnv = process.env.PACKAGE_DIR;
  process.env.PACKAGE_DIR = packageDir;

  const tsdownArgs = [
    `./node_modules/.bin/tsdown --config ${vxPath.tsdownConfigPath}`,
    options.cliOptions,
  ];

  try {
    exec(tsdownArgs);
  } finally {
    if (prevEnv === undefined) {
      delete process.env.PACKAGE_DIR;
    } else {
      process.env.PACKAGE_DIR = prevEnv;
    }
  }
}

module.exports = buildPackage;
