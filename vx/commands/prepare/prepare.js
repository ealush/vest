const genVitestConfig = require('../../scripts/genVitestConfig');

const genNpmIgnore = require('vx/commands/npmignore/npmignore');
const genTsConfig = require('vx/commands/tsconfig/tsconfig');
const logger = require('vx/logger');

module.exports = () => {
  logger.info('Preparing packages...');
  genNpmIgnore();
  genTsConfig();
  genVitestConfig();
};
