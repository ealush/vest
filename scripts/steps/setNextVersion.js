const { exec, packagePath, logger } = require('../../util');

function setNextVersion({ packageName, tagId, tag, nextVersion }) {
  nextVersion = tag ? tagId : nextVersion;

  logger.info('🔢 Setting next version.');

  exec(
    `yarn --cwd ${packagePath(
      packageName
    )} version --new-version ${nextVersion} --no-git-tag-version`
  );
}

module.exports = setNextVersion;
