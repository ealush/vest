import exec from 'vx/exec.js';
import * as logger from 'vx/logger.js';
import joinTruthy from 'vx/util/joinTruthy.js';
import * as taggedBranch from 'vx/util/taggedBranch.js';
import { usePackage } from 'vx/vxContext.js';
import vxPath from 'vx/vxPath.js';

type PublishData = { tag?: string; tagId: string; versionToPublish: string };

function publishPackage({ tag, tagId, versionToPublish }: PublishData): void {
  const packageName = usePackage();

  if (!packageName) {
    throw new Error('Package context is required for publishing.');
  }

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

function clearTag(tag?: string, tagId?: string): void {
  if (tag && tagId) {
    exec(`git tag -d ${tagId} || echo "git tag not found. skipping."`, {
      exitOnFailure: false,
      throwOnFailure: false,
    });
  }
}

function execCommandWithGitConfig(command: Array<string | undefined>): void {
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

function genPublishCommand(tag?: string): Array<string | undefined> {
  const packageName = usePackage();
  if (!packageName) {
    throw new Error('Package context is required for publishing.');
  }

  // Use npm directly instead of yarn so that OIDC Trusted Publishing works
  return [
    `cd ${vxPath.package(packageName)} && npm publish`,
    tag && `--tag ${tag}`,
    `--provenance`, // Recommended for trusted publishers
  ];
}

function shouldRelease(_versionToUse: string): boolean {
  return taggedBranch.branchAllowsRelease;
}
