const packageJson = require('../../../util/packageJson');

const exec = require('vx/exec');
const logger = require('vx/logger');
const { isReleaseBranch } = require('vx/util/taggedBranch');
const { usePackage } = require('vx/vxContext');
const vxPath = require('vx/vxPath');

function setNextVersion({ tagId, tag, nextVersion }) {
  nextVersion = tag ? tagId : nextVersion;

  const command = `yarn --cwd ${vxPath.package()} version --no-git-tag-version --new-version ${nextVersion}`;

  logger.info(`🔢 Setting next version for ${usePackage()}.
  Running: ${command}
  `);

  if (isReleaseBranch) {
    return;
  }

  exec(command);

  logger.info(
    `🔢 Updated ${usePackage()} version to: ` + packageJson().version
  );
}

module.exports = setNextVersion;
