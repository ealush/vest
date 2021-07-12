const isReleaseBranch = require('../../release/isReleaseBranch');

const exec = require('vx/exec');
const logger = require('vx/logger');
const packageName = require('vx/packageName');
const dryRun = require('vx/util/dryRun');
const joinTruthy = require('vx/util/joinTruthy');

function publishPackage({ tag, tagId, nextVersion }) {
  if (!isReleaseBranch()) {
    logger.info(`❌  Not in release branch. Skipping publish.`);
  }

  const versionToUse = tag && tagId ? tagId : nextVersion;

  logger.info(`🚀 Publishing package ${packageName()}.
    Version: ${versionToUse}
    Tag Id: ${tagId}
    Tag: ${tag}`);

  if (dryRun.isDryRun()) {
    return dryRun.dryRunExitMessage(publishPackage);
  }

  const command = genPublishCommand(nextVersion, tag);
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
    `yarn workspace ${packageName()} publish`,
    `--new-version ${versionToUse}`,
    tag && `--tag ${tag}`,
  ];
}
