const isReleaseBranch = require('../scripts/release/isReleaseBranch');
const pushToLatestBranch = require('../scripts/release/steps/pushToLatestBranch');
const updateDocs = require('../scripts/release/steps/updateDocs');

const exec = require('vx/exec');
const logger = require('vx/logger');
const dryRun = require('vx/util/dryRun');

require('../scripts/genTsConfig');

function release(packageName) {
  if (packageName) {
    exec([
      `yarn workspace ${packageName} run vx releasePackage`,
      dryRun.cliOpt(),
    ]);
  } else {
    releaseAll();
  }
}

module.exports = release;

function releaseAll() {
  logger.info('🏃 Running release script.');

  exec(['yarn workspaces run vx release', dryRun.cliOpt()]);

  if (!isReleaseBranch()) {
    logger.info(`❌  Not in release branch. Not pushing changes to git.`);
  }

  updateDocs();

  pushToLatestBranch();
}
