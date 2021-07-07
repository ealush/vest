const packageJson = require('../../../util/packageJson');
const packageName = require('vx/packageName');

const exec = require('vx/exec');
const logger = require('vx/logger');

function setNextVersion({ tagId, tag, nextVersion }) {
  nextVersion = tag ? tagId : nextVersion;

  logger.info('🔢 Setting next version.');

  exec(
    `yarn workspace ${packageName()} version --no-git-tag-version --new-version ${nextVersion}`
  );

  logger.info('🔢 Updated version to: ' + packageJson().version);
}

module.exports = setNextVersion;
