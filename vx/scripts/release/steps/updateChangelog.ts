import fs from 'fs';

import { format } from 'date-fns';
import fse from 'fs-extra';

import determineLevel from '../determineChangeLevel.js';
import type { ChangeLevel } from '../determineChangeLevel.js';
import {
  KEYWORD_MAJOR,
  KEYWORD_MINOR,
  KEYWORD_PATCH,
  CHANGELOG_TITLES,
} from '../releaseKeywords.js';

import * as logger from 'vx/logger.js';
import * as opts from 'vx/opts.js';
import { usePackage } from 'vx/vxContext.js';
import vxPath from 'vx/vxPath.js';

type ChangelogData = { messages: string[]; nextVersion: string };

function updateChangelog({ messages, nextVersion }: ChangelogData): {
  title: string;
  body: string;
} {
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

function changelogTitle(version: string): string {
  return `## ${version} - ${format(new Date(), 'yyyy-MM-dd')}`;
}

function groupMessages(
  messages: string[],
): Partial<Record<ChangeLevel, string>> {
  return messages.reduce<Partial<Record<ChangeLevel, string>>>(
    (accumulator, message) => {
      const level = determineLevel(message);

      if (!accumulator[level]) {
        accumulator[level] = `### ${CHANGELOG_TITLES[level]}\n`;
      }

      return Object.assign(accumulator, {
        [level]: `${accumulator[level]}- ${message}\n`,
      });
    },
    {},
  );
}

function changelogPath(): string {
  const packageName = usePackage();
  if (!packageName) {
    throw new Error('Package context is required for changelog updates.');
  }
  return vxPath.package(packageName, opts.fileNames.CHANGELOG);
}

function getChangelog(): string {
  fse.ensureFileSync(changelogPath());

  if (fs.readFileSync(changelogPath(), 'utf8') === '') {
    writeChangelog(createChangelogTemplate());
  }

  return fs.readFileSync(changelogPath(), 'utf8');
}

function writeChangelog(changelog: string): void {
  fse.writeFileSync(changelogPath(), changelog);
}

function createChangelogTemplate(): string {
  const packageName = usePackage() ?? 'unknown package';

  return `# ${packageName} - Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).
`;
}
