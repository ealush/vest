import exec from 'vx/exec.js';
import * as logger from 'vx/logger.js';
import joinTruthy from 'vx/util/joinTruthy.js';
import * as taggedBranch from 'vx/util/taggedBranch.js';
import { usePackage } from 'vx/vxContext.js';

/**
 * Publishes the currently scoped package to npm with optional dist-tag.
 * @param {{ tag?: string, tagId: string, versionToPublish: string }} param0 Release metadata.
 * @returns {void}
 */
function publishPackage({ tag, tagId, versionToPublish }) {
  logger.info(`🚀 Publishing package ${usePackage()}.
    Version: ${versionToPublish}
    Tag Id: ${tagId}
    Tag: ${tag}`);

  if (!shouldRelease(versionToPublish)) {
    return logger.info(`❌  Not in release branch. Skipping publish.`);
  }

  const command = genPublishCommand(tag);
  execCommandWithGitConfig(command);
  clearTag(tag, tagId);
}

export default publishPackage;

/**
 * Removes the temporary tag after publish.
 * @param {string | undefined} tag Dist-tag used for publish.
 * @param {string | undefined} tagId Full tag identifier.
 */
function clearTag(tag, tagId) {
  if (tag && tagId) {
    exec(`git tag -d ${tagId} || echo "git tag not found. skipping."`, {
      exitOnFailure: false,
      throwOnFailure: false,
    });
  }
}

/**
 * Executes the publish command with required git config.
 * @param {string[]} command Command array to run.
 */
function execCommandWithGitConfig(command) {
  const { EMAIL_ADDRESS, GIT_NAME } = process.env;

  logger.info(
    `Setting git config:
    Email "${EMAIL_ADDRESS}"
    Name "${GIT_NAME}"`,
  );

  exec(
    `git config --global user.email "${EMAIL_ADDRESS}"
git config --global user.name "${GIT_NAME}"
${joinTruthy(command, ' ')}`,
    { exitOnFailure: false },
  );
}

/**
 * Builds the npm publish command for the active package.
 * @param {string | undefined} tag Optional dist-tag.
 * @returns {string[]}
 */
function genPublishCommand(tag) {
  return [`yarn workspace ${usePackage()} npm publish`, tag && `--tag ${tag}`];
}

/**
 * Determines whether publishing should run on the current branch.
 * @param {string} _versionToUse Next version (unused).
 * @returns {boolean}
 */
function shouldRelease(_versionToUse) {
  return taggedBranch.branchAllowsRelease;
}
