const fs = require('fs');

const { format } = require('date-fns');

const { logger } = require('../../../util');
const determineLevel = require('../determineChangeLevel');
const {
  KEYWORD_MAJOR,
  KEYWORD_MINOR,
  KEYWORD_PATCH,
  CHANGELOG_TITLES,
} = require('../releaseKeywords');

function changelogTitle(packageName, version) {
  return `## ${packageName}: [${version}] - ${format(
    new Date(),
    'yyyy-MM-dd'
  )}\n`;
}

/**
 * Takes commit history and groups messages by change level
 * @param {String[]} gitLog commit history
 * @return {Object} an object with keys matching the semver levels
 */
function groupMessages(messages) {
  return messages.reduce((accumulator, message) => {
    const level = determineLevel(message);

    if (!accumulator[level]) {
      accumulator[level] = `### ${CHANGELOG_TITLES[level]}\n`;
    }

    return Object.assign(accumulator, {
      [level]: `${accumulator[level]}- ${message}\n`,
    });
  }, {});
}

function updateChangelog({ packageName, messages, nextVersion }) {
  logger.info('📝 Updating changelog.');

  const groupedMessages = groupMessages(messages);
  const title = changelogTitle(packageName, nextVersion);

  const body = [
    groupedMessages[KEYWORD_MAJOR],
    groupedMessages[KEYWORD_MINOR],
    groupedMessages[KEYWORD_PATCH],
  ]
    .filter(Boolean)
    .join('\n');

  const versionLog = [title, body].join('\n');

  const changelog = fs.readFileSync('./CHANGELOG.md', 'utf8').split('\n');
  changelog.splice(6, 0, versionLog);

  fs.writeFileSync('./CHANGELOG.md', changelog.join('\n'));

  return { title, body };
}

module.exports = updateChangelog;
