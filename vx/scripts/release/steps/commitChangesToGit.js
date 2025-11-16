const path = require('path');

const { sample } = require('lodash');

const listAllChangesSinceStableBranch = require('../github/listAllChangesSinceStableBranch');
const matchPackageNameInCommit = require('../github/matchPackageNameInCommit');

const exec = require('vx/exec');
const logger = require('vx/logger');
const opts = require('vx/opts');
const packageNames = require('vx/packageNames');
const packageJson = require('vx/util/packageJson');
const vxPath = require('vx/vxPath');

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

const EMOJIS = ['🚀', '🦺', '🤘', '✨', '🌈', '✅'];

/**
 * Pushes release commits and tags to git.
 */
function commitChangesToGit() {
  logger.info('🌎 Pushing latest branch.');

  const allChanges = listAllChangesSinceStableBranch();
  const changedPackages = filterChangedPackages(allChanges);

  pushToLatestBranch(allChanges, changedPackages);
  createTags(changedPackages);
}

module.exports = commitChangesToGit;

/**
 * Pushes changes to the latest branch using the provided commit message.
 * @param {{ title: string }[]} allChanges All commits since stable.
 * @param {string[]} changedPackages Packages included in the release.
 */
function pushToLatestBranch(allChanges, changedPackages) {
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
 * @param {{ title: string, files: string[] }[]} commits Commits between stable and current branch.
 * @returns {string[]} Names of changed packages.
 */
function filterChangedPackages(commits) {
  return packageNames.list.filter(packageName => {
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
 * @param {string[]} changedPackages Packages included in the release.
 * @returns {string}
 */
function createCommitMessage(changedPackages) {
  const msg = changedPackages
    .map(
      packageName => `[${packageName}]: (${packageJson(packageName).version})`,
    )
    .join(', ');

  return `${sample(EMOJIS)} Updating: ${msg}`;
}

/**
 * Tags each changed package with its published version.
 * @param {string[]} changedPackages Packages included in the release.
 * @returns {void}
 */
function createTags(changedPackages) {
  return changedPackages.forEach(packageName => {
    const version = packageJson(packageName).version;
    const tag = `${packageName}@${version}`;

    exec(['sh', CREATE_GIT_TAG, tag]);
  });
}
