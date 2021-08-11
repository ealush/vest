const isReleaseBranch = require('../../release/isReleaseBranch');

const exec = require('vx/exec');
const logger = require('vx/logger');
const packageName = require('vx/packageName');
const { TAG_DEV } = require('vx/scripts/release/releaseKeywords');
const joinTruthy = require('vx/util/joinTruthy');
const vxPath = require('vx/vxPath');

function publishPackage({ tag, tagId, nextVersion }) {
  const versionToUse = tag && tagId ? tagId : nextVersion;

  logger.info(`🚀 Publishing package ${packageName()}.
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
  return [
    `yarn --cwd ${vxPath.package()} publish`,
    `--new-version ${versionToUse}`,
    tag && `--tag ${tag}`,
  ];
}

function shouldPublishDev(versionToUse) {
  const [, tag] = versionToUse.split('-');

  return tag === TAG_DEV;
}

function shouldRelease(versionToUse) {
  return isReleaseBranch() || shouldPublishDev(versionToUse);
}
