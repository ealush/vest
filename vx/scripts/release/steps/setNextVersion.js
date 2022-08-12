const exec = require('vx/exec');
const logger = require('vx/logger');
const { usePackage } = require('vx/vxContext');
const vxPath = require('vx/vxPath');

const packageJson = require('../../../util/packageJson');

function setNextVersion({ tagId, tag, nextVersion }) {
  nextVersion = tag ? tagId : nextVersion;

  const command = `yarn --cwd ${vxPath.package()} version --no-git-tag-version --new-version ${nextVersion}`;

  logger.info(`🔢 Setting next version for ${usePackage()}.
  Running: ${command}
  `);

  exec(command);

  logger.info(
    `🔢 Updated ${usePackage()} version to: ` + packageJson().version
  );
}

module.exports = setNextVersion;
