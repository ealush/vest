import fs from 'fs';

import { format } from 'date-fns';
import fse from 'fs-extra';

import * as opts from '../../../opts.js';
import { usePackage } from '../../../vxContext.js';
import determineLevel from '../determineChangeLevel.js';
import {
  KEYWORD_MAJOR,
  KEYWORD_MINOR,
  KEYWORD_PATCH,
  CHANGELOG_TITLES,
} from '../releaseKeywords.js';

import * as logger from 'vx/logger.js';
import vxPath from 'vx/vxPath.js';

/**
 * Appends a changelog entry for the current package.
 * @param {{ messages: string[], nextVersion: string }} param0 Release data.
 * @returns {{ title: string, body: string }} Rendered changelog content.
 */
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

export default updateChangelog;

/**
 * Generates a changelog title for the provided version.
 * @param {string} version Next version number.
 * @returns {string}
 */
function changelogTitle(version) {
  return `## ${version} - ${format(new Date(), 'yyyy-MM-dd')}`;
}

/**
 * Takes commit history and groups messages by change level.
 * @param {string[]} messages Commit messages.
 * @returns {Record<string, string>} Object with keys matching semver levels.
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

/**
 * Returns the path to the changelog file for the current package.
 * @returns {string}
 */
function changelogPath() {
  return vxPath.package(usePackage(), opts.fileNames.CHANGELOG);
}

/**
 * Reads the changelog file, creating it if it doesn't exist.
 * @returns {string}
 */
function getChangelog() {
  fse.ensureFileSync(changelogPath());

  if (fs.readFileSync(changelogPath(), 'utf8') === '') {
    writeChangelog(changelogTemplate);
  }

  return fs.readFileSync(changelogPath(), 'utf8');
}

/**
 * Writes content to the changelog file.
 * @param {string} changelog Content to write.
 * @returns {void}
 */
function writeChangelog(changelog) {
  fse.writeFileSync(changelogPath(), changelog);
}

const changelogTemplate = `# ${usePackage()} - Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).
`;
