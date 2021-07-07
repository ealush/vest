const isReleaseBranch = require('../scripts/release/isReleaseBranch');
const releasePackage = require('../scripts/release/releasePackage');
const pushToLatestBranch = require('../scripts/release/steps/pushToLatestBranch');
const updateDocs = require('../scripts/release/steps/updateDocs');

const exec = require('vx/exec');
const logger = require('vx/logger');
const packageName = require('vx/packageName');

require('../scripts/genTsConfig');

function release() {
  if (packageName()) {
    releasePackage();
  } else {
    releaseAll();
  }
}

module.exports = release;

function releaseAll() {
  logger.info('🏃 Running release script.');

  exec('yarn workspaces run release');

  if (!isReleaseBranch()) {
    logger.info(`❌  Not in release branch. Not pushing changes to git.`);
  }

  updateDocs();

  pushToLatestBranch();
}
