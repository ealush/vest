const isReleaseBranch = require('../scripts/release/isReleaseBranch');
const pushToLatestBranch = require('../scripts/release/steps/pushToLatestBranch');
const updateDocs = require('../scripts/release/steps/updateDocs');

const exec = require('vx/exec');
const logger = require('vx/logger');
const packagesToRelease = require('vx/scripts/release/packagesToRelease');
const dryRun = require('vx/util/dryRun');
const integrationBranch = require('vx/util/integrationBranch');
require('../scripts/genTsConfig');

function release(packageName) {
  const pkg = packageName || integrationBranch.targetPackage;
  if (pkg) {
    exec(['yarn workspace', pkg, 'run vx releasePackage', dryRun.cliOpt()]);
  } else {
    releaseAll();
  }
}

module.exports = release;

async function releaseAll() {
  logger.info('🏃 Running release script.');

  const releaseList = await packagesToRelease();

  releaseList.forEach(name => {
    exec(['yarn workspace', name, 'run vx release', dryRun.cliOpt()]);
  });

  if (!isReleaseBranch()) {
    logger.info(`❌  Not in release branch. Not pushing changes to git.`);
    return;
  }

  updateDocs();

  pushToLatestBranch();
}
