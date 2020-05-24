const path = require('path');
const { sample } = require('lodash');
const { ROOT_PATH } = require('../../config');
const { exec, logger } = require('../../util');

const SCRIPT_PATH = path.resolve(
  ROOT_PATH,
  'scripts',
  'steps',
  'push_to_default_branch.sh'
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

function pushToDefaultBranch(packageData, messages) {
  logger.info('🌎 Pushing default default branch.');

  const command = [
    'sh',
    SCRIPT_PATH,
    `"${createCommitMessage(packageData)}"`,
    `"${messages.join('\n')}"`,
  ].join(' ');

  exec(command);
}

module.exports = pushToDefaultBranch;
