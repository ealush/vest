const packageJson = require('../../../util/packageJson');
const isReleaseBranch = require('../isReleaseBranch');

const exec = require('vx/exec');
const logger = require('vx/logger');
const packageName = require('vx/packageName');
const dryRun = require('vx/util/dryRun');

function setNextVersion({ tagId, tag, nextVersion }) {
  nextVersion = tag ? tagId : nextVersion;

  const command = `yarn workspace ${packageName()} version --no-git-tag-version --new-version ${nextVersion}`;

  logger.info(`🔢 Setting next version for ${packageName()}.
  Running: ${command}
  `);

  if (isReleaseBranch()) {
    return;
  }

  if (dryRun.isDryRun()) {
    return logger.info(`setNextVersion: Dry run mode. Exiting.`);
  }
  exec(command);

  logger.info(
    `🔢 Updated ${packageName()} version to: ` + packageJson().version
  );
}

module.exports = setNextVersion;
