const path = require('path');

const { sample } = require('lodash');

const { exec, logger, filePaths } = require('../../../util');

const SCRIPT_PATH = path.resolve(
  filePaths.ROOT_PATH,
  'scripts',
  'release',
  'steps',
  'push_to_latest_branch.sh'
);

const EMOJIS = [
  '🚀',
  '🤘',
  '✨',
  '🔔',
  '🌈',
  '🤯',
  '✅',
  '💫',
  '🤩',
  '💥',
  '🕶',
  '📢',
];

function createCommitMessage(packageData) {
  const msg = packageData
    .map(({ packageName, nextVersion }) => `[${packageName}]: (${nextVersion})`)
    .join(', ');

  return `${sample(EMOJIS)} Updating: ${msg}`;
}

function pushToLatestBranch(packageData, messages) {
  logger.info('🌎 Pushing latest branch.');

  const command = [
    'sh',
    SCRIPT_PATH,
    `"${createCommitMessage(packageData)}"`,
    `"${messages.join('\n')}"`,
  ].join(' ');

  exec(command);
}

module.exports = pushToLatestBranch;
