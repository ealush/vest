const isReleaseBranch = require('../scripts/release/isReleaseBranch');
const pushToLatestBranch = require('../scripts/release/steps/pushToLatestBranch');
const updateDocs = require('../scripts/release/steps/updateDocs');

const logger = require('vx/logger');
const packageName = require('vx/packageName');
const packagesToRelease = require('vx/scripts/release/packagesToRelease');
const releasePackage = require('vx/scripts/release/releasePackage');
const integrationBranch = require('vx/util/integrationBranch');
const ctx = require('vx/vxContext');
require('../scripts/genTsConfig');

function release() {
  const pkg = packageName() || integrationBranch.targetPackage;
  if (pkg) {
    return ctx.withPackage(pkg, releasePackage);
  } else {
    releaseAll();
  }
}

module.exports = release;

async function releaseAll() {
  logger.info('🏃 Running release script.');

  const releaseList = await packagesToRelease();

  releaseList.forEach(name => {
    ctx.withPackage(name, release);
  });

  if (!isReleaseBranch()) {
    logger.info(`❌  Not in release branch. Not pushing changes to git.`);
    return;
  }

  updateDocs();

  pushToLatestBranch();
}
