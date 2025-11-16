const fse = require('fs-extra');

const cleanupDistFiles = require('./cleanupDistFiles');

const exec = require('vx/exec');
const logger = require('vx/logger');
const { usePackage } = require('vx/vxContext');
const vxPath = require('vx/vxPath');

function buildPackage(options = {}) {
  const name = usePackage();
  logger.info(`🛠 Building package: ${name}`);

  cleanupDistFiles(name);

  const packageConfig = vxPath.package(name, 'tsdown.config.ts');

  const tsdownArgs = [`./node_modules/.bin/tsdown --config ${packageConfig}`, options.cliOptions];

  exec(tsdownArgs);
}

module.exports = buildPackage;
