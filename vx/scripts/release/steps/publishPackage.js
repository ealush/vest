const isReleaseBranch = require('../../release/isReleaseBranch');
const packageName = require('vx/packageName');

const exec = require('vx/exec');
const logger = require('vx/logger');

function publishPackage({ tag, tagId }) {
  if (!isReleaseBranch()) {
    logger.info(`❌  Not in release branch. Skipping publish.`);
  }

  logger.info(`🚀 Publishing package: ${packageName()}`);

  const command = genPublishCommand(tag, tagId);
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

  exec(
    `
git config --global user.email "${EMAIL_ADDRESS}"
git config --global user.name "${GIT_NAME}"
${command}`,
    { exitOnFailure: false }
  );
}

function genPublishCommand(tag, tagId) {
  return [
    `yarn workspace ${packageName()} publish`,
    tag && tagId && `--new-version ${tagId}`,
    tag && `--tag ${tag}`,
  ]
    .filter(Boolean)
    .join(' ');
}
