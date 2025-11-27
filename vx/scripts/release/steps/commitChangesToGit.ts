import path from 'path';

import sample from 'lodash/sample.js';

import listAllChangesSinceStableBranch from '../github/listAllChangesSinceStableBranch.js';
import matchPackageNameInCommit from '../github/matchPackageNameInCommit.js';

import exec from 'vx/exec.js';
import * as logger from 'vx/logger.js';
import * as opts from 'vx/opts.js';
import { packageNames } from 'vx/packageNames.js';
import packageJson from 'vx/util/packageJson.js';
import vxPath from 'vx/vxPath.js';

const RELEASE_SCRIPTS = path.resolve(
  vxPath.VX_SCRIPTS_PATH,
  'release',
  'steps',
);

const PUSH_TO_LATEST_BRANCH = path.resolve(
  RELEASE_SCRIPTS,
  'push_to_latest_branch.sh',
);

const CREATE_GIT_TAG = path.resolve(RELEASE_SCRIPTS, 'create_git_tag.sh');

const EMOJIS = [
  '\ud83d\ude80',
  '\ud83e\uddba',
  '\ud83e\udd18',
  '\u2728',
  '\ud83c\udf08',
  '\u2705',
];

type CommitChange = { title: string; files: string[] };

/**
 * Pushes release commits and tags to git.
 */
function commitChangesToGit(): void {
  logger.info('\ud83c\udf0e Pushing latest branch.');

  const allChanges = listAllChangesSinceStableBranch();
  const changedPackages = filterChangedPackages(allChanges);

  pushToLatestBranch(allChanges, changedPackages);
  createTags(changedPackages);
}

export default commitChangesToGit;

/**
 * Pushes changes to the latest branch using the provided commit message.
 */
function pushToLatestBranch(
  allChanges: CommitChange[],
  changedPackages: string[],
): void {
  const messages = allChanges.map(({ title }) => title);

  exec([
    'sh',
    PUSH_TO_LATEST_BRANCH,
    `"${createCommitMessage(changedPackages)}"`,
    `"${messages.join('\n')}"`,
  ]);
}

/**
 * Filters commits to packages changed in the current release window.
 */
function filterChangedPackages(commits: CommitChange[]): string[] {
  return packageNames.list.filter((packageName: string) => {
    return commits.some(({ title, files }) => {
      return (
        !!title.match(matchPackageNameInCommit(packageName)) ||
        !!files.some(file => {
          return file.match(`${opts.dir.PACKAGES}/${packageName}`);
        })
      );
    });
  });
}

/**
 * Creates a commit message summarizing updated packages.
 */
function createCommitMessage(changedPackages: string[]): string {
  const msg = changedPackages
    .map(packageName => {
      const version = packageJson(packageName).version ?? 'unknown';
      return `[${packageName}]: (${version})`;
    })
    .join(', ');

  return `${sample(EMOJIS) ?? '\uD83D\uDD16'} Updating: ${msg}`;
}

/**
 * Tags each changed package with its published version.
 */
function createTags(changedPackages: string[]): void {
  return changedPackages.forEach(packageName => {
    const version = packageJson(packageName).version ?? '0.0.0';
    const tag = `${packageName}@${version}`;

    exec(['sh', CREATE_GIT_TAG, tag]);
  });
}
