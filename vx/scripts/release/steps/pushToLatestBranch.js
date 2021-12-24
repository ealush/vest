const path = require('path');

const { sample } = require('lodash');

const packageJson = require('../../../util/packageJson');
const listAllChangesSinceStableBranch = require('../github/listAllChangesSinceStableBranch');
const matchPackageNameInCommit = require('../github/matchPackageNameInCommit');

const exec = require('vx/exec');
const logger = require('vx/logger');
const packageNames = require('vx/packageNames');
const vxPath = require('vx/vxPath');

const SCRIPT_PATH = path.resolve(
  vxPath.ROOT_PATH,
  'scripts',
  'release',
  'steps',
  'push_to_latest_branch.sh'
);

const EMOJIS = ['🚀', '🦺', '🤘', '✨', '🌈', '✅'];

function pushToLatestBranch() {
  logger.info('🌎 Pushing latest branch.');

  const allChanges = listAllChangesSinceStableBranch();
  const changedPackages = filterChangedPackages(allChanges);
  const messages = allChanges.map(({ title }) => title);
  const command = [
    'sh',
    SCRIPT_PATH,
    `"${createCommitMessage(changedPackages)}"`,
    `"${messages.join('\n')}"`,
  ].join(' ');

  exec(command);
}

module.exports = pushToLatestBranch;

function filterChangedPackages(commits) {
  return packageNames.list.filter(packageName => {
    return commits.some(({ title, files }) => {
      return (
        !!title.match(matchPackageNameInCommit(packageName)) ||
        !!files.some(file => {
          return file.match(`packages/${packageName}`);
        })
      );
    });
  });
}

function createCommitMessage(changedPackages) {
  const msg = changedPackages
    .map(
      packageName => `[${packageName}]: (${packageJson(packageName).version})`
    )
    .join(', ');

  return `${sample(EMOJIS)} Updating: ${msg}`;
}
