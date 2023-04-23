const logger = require('vx/logger');

const genNpmIgnore = require('../npmignore/npmignore');
const genTsConfig = require('../tsconfig/tsconfig');

module.exports = () => {
  logger.info('Preparing packages...');
  genNpmIgnore();
  genTsConfig();
};
