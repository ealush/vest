const packageJson = require('../../../util/packageJson');
const isReleaseBranch = require('../isReleaseBranch');

const exec = require('vx/exec');
const logger = require('vx/logger');
const packageName = require('vx/packageName');
const vxPath = require('vx/vxPath');

function setNextVersion({ tagId, tag, nextVersion }) {
  nextVersion = tag ? tagId : nextVersion;

  const command = `yarn --cwd ${vxPath.package()} version --no-git-tag-version --new-version ${nextVersion}`;

  logger.info(`🔢 Setting next version for ${packageName()}.
  Running: ${command}
  `);

  if (isReleaseBranch()) {
    return;
  }

  exec(command);

  logger.info(
    `🔢 Updated ${packageName()} version to: ` + packageJson().version
  );
}

module.exports = setNextVersion;
