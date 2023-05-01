const exec = require('vx/exec');
const logger = require('vx/logger');
const { TAG_DEV } = require('vx/scripts/release/releaseKeywords');
const joinTruthy = require('vx/util/joinTruthy');
const { isReleaseBranch } = require('vx/util/taggedBranch');
const { usePackage } = require('vx/vxContext');
const vxPath = require('vx/vxPath');

const { TAG_NEXT } = require('../releaseKeywords');

function publishPackage({ tag, tagId, nextVersion }) {
  const versionToUse = tag && tagId ? tagId : nextVersion;

  logger.info(`🚀 Publishing package ${usePackage()}.
    Version: ${versionToUse}
    Tag Id: ${tagId}
    Tag: ${tag}`);

  if (!shouldRelease(versionToUse)) {
    return logger.info(`❌  Not in release branch. Skipping publish.`);
  }

  const command = genPublishCommand(versionToUse, tag);
  execCommandWithGitConfig(command);
  clearTag(tag, tagId);
}

module.exports = publishPackage;

function clearTag(tag, tagId) {
  if (tag && tagId) {
    exec(`git tag -d ${tagId}`, {
      exitOnFailure: false,
      throwOnFailure: false,
    });
  }
}

function execCommandWithGitConfig(command) {
  const { EMAIL_ADDRESS, GIT_NAME } = process.env;

  logger.info(
    `Setting git config:
    Email "${EMAIL_ADDRESS}"
    Name "${GIT_NAME}"`
  );

  exec(
    `git config --global user.email "${EMAIL_ADDRESS}"
git config --global user.name "${GIT_NAME}"
${joinTruthy(command, ' ')}`,
    { exitOnFailure: false }
  );
}

function genPublishCommand(versionToUse, tag) {
  const package = usePackage();
  return [`yarn workspace ${package} npm publish`, tag && `--tag ${tag}`];
}

function shouldPublishPreRelease(versionToUse) {
  const [, tag] = versionToUse.split('-');

  return [TAG_DEV, TAG_NEXT].includes(tag);
}

function shouldRelease(versionToUse) {
  return isReleaseBranch || shouldPublishPreRelease(versionToUse);
}
