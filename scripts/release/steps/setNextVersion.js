const { exec, packagePath, logger, packageJson } = require('../../../util');

function setNextVersion({ packageName, tagId, tag, nextVersion }) {
  nextVersion = tag ? tagId : nextVersion;

  logger.info('🔢 Setting next version.');

  exec(
    `npm version ${nextVersion} --no-git-tag-version --prefix ${packagePath(
      packageName
    )}`
  );

  logger.info('🔢 Updated version to: ' + packageJson(packageName).version);
}

module.exports = setNextVersion;
