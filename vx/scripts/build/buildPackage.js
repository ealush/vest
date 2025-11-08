const fse = require('fs-extra');

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

  const format = [];

  if (options.fastBuild) {
    format.push(opts.format.ES);
  }

  const baseOptions = {
    cliOptions: options.cliOptions,
    format,
    fastBuild: options.fastBuild,
  };

  // BUILD MAIN
  buildRollup({
    ...baseOptions,
    buildEntry: opts.vx_config.VX_ROLLUP_BUILD_ENTRY_MAIN,
    env: opts.env.PRODUCTION,
  });

  if (!options.fastBuild) {
    buildRollup({
      ...baseOptions,
      buildEntry: opts.vx_config.VX_ROLLUP_BUILD_ENTRY_MAIN,
      env: opts.env.DEVELOPMENT,
    });
  }

  const packageExportsPath = vxPath.packageSrcExports(name);

  // BUILD EXPORTS
  if (fse.existsSync(packageExportsPath)) {
    buildRollup({
      ...baseOptions,
      buildEntry: opts.vx_config.VX_ROLLUP_BUILD_ENTRY_EXPORTS,
      env: opts.env.PRODUCTION,
    });

    if (!options.fastBuild) {
      buildRollup({
        ...baseOptions,
        buildEntry: opts.vx_config.VX_ROLLUP_BUILD_ENTRY_EXPORTS,
        env: opts.env.DEVELOPMENT,
      });
    }
  }

  delete process.env.VX_PACKAGE_NAME;
}

function buildRollup({
  cliOptions,
  format = [],
  fastBuild = false,
  buildEntry,
  env = opts.env.PRODUCTION,
}) {
  exec([
    `yarn rollup -c`,
    vxPath.ROLLUP_CONFIG_PATH,
    cliOptions,
    format.length && `--format=${format}`,
    `--${opts.vx_config.VX_ROLLUP_ENV}=${env}`,
    `--${opts.vx_config.VX_ROLLUP_FAST_BUILD}=${fastBuild}`,
    `--${opts.vx_config.VX_ROLLUP_BUILD_ENTRY}=${buildEntry}`,
  ]);
}

module.exports = buildPackage;
