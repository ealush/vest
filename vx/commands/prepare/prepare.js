const genVitestConfig = require('../../scripts/genVitestConfig');

const genNpmIgnore = require('vx/commands/npmignore/npmignore');
const genTsConfig = require('vx/commands/tsconfig/tsconfig');
const logger = require('vx/logger');

/**
 * Generates supporting config files for all packages.
 */
module.exports = () => {
  logger.info('Preparing packages...');
  genNpmIgnore();
  genTsConfig();
  genVitestConfig();
};
