const fs = require('fs');

const { format } = require('date-fns');
const fse = require('fs-extra');

const determineLevel = require('../determineChangeLevel');
const {
  KEYWORD_MAJOR,
  KEYWORD_MINOR,
  KEYWORD_PATCH,
  CHANGELOG_TITLES,
} = require('../releaseKeywords');

const logger = require('vx/logger');
const packageName = require('vx/packageName');
const writeFileSync = require('vx/util/writeFileSync');
const vxPath = require('vx/vxPath');

function updateChangelog({ messages, nextVersion }) {
  logger.info('📝 Updating changelog.');

  const groupedMessages = groupMessages(messages);
  const title = changelogTitle(nextVersion);

  const body = [
    groupedMessages[KEYWORD_MAJOR],
    groupedMessages[KEYWORD_MINOR],
    groupedMessages[KEYWORD_PATCH],
  ]
    .filter(Boolean)
    .join('\n');

  const versionLog = [title, body].join('\n');

  const changelog = getChangelog().split('\n');
  changelog.splice(6, 0, versionLog);

  writeChangelog(changelog.join('\n'));

  return { title, body };
}

module.exports = updateChangelog;

function changelogTitle(version) {
  return `## ${version} - ${format(new Date(), 'yyyy-MM-dd')}`;
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

function changelogPath() {
  return vxPath.package(packageName(), './CHANGELOG.md');
}

function getChangelog() {
  fse.ensureFileSync(changelogPath());

  if (fs.readFileSync(changelogPath(), 'utf8') === '') {
    writeChangelog(changelogTemplate);
  }

  return fs.readFileSync(changelogPath(), 'utf8');
}

function writeChangelog(changelog) {
  writeFileSync(changelogPath(), changelog);
}

const changelogTemplate = `# ${packageName()} - Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).
`;
