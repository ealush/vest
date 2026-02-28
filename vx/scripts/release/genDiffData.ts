import { inc } from 'semver';

import determineChangeLevel, {
  type ChangeLevel,
} from './determineChangeLevel.js';

import * as logger from 'vx/logger.js';
import { release_tags } from 'vx/opts.js';
import packageJson from 'vx/util/packageJson.js';
import {
  isIntegrationBranch,
  isReleaseBranch,
  isNextBranch,
  isReleaseKeepVersionBranch,
  isNightlyBranch,
  isLatestBranch,
  CURRENT_BRANCH,
} from 'vx/util/taggedBranch.js';
import { usePackage } from 'vx/vxContext.js';

const { GITHUB_SHA } = process.env;

type DiffData = {
  changeLevel: ChangeLevel;
  messages: string[];
  nextVersion: string;
  packageName?: string;
  tag?: string;
  tagId: string;
  version: string;
  versionToPublish: string;
};

// commits: [{title: "...", files: ["..."]}]
function genDiffData(
  commits: Array<{ title: string; files?: string[] }>,
): DiffData {
  const version = packageJson().version;

  if (!version) {
    throw new Error('Package version is missing.');
  }

  const messages = commits.map(({ title }) => title);
  const changeLevel = determineChangeLevel(...messages);
  const nextVersion = inc(version, changeLevel);

  if (!nextVersion) {
    throw new Error('Failed to calculate next version.');
  }

  const tagId = pickTagId(nextVersion);
  const [, tag] = tagId.split('-');
  return {
    changeLevel,
    messages,
    nextVersion,
    packageName: usePackage(),
    tag,
    tagId,
    version,
    versionToPublish: isReleaseKeepVersionBranch
      ? version
      : tag
        ? tagId
        : nextVersion,
  };
}

export default genDiffData;

// eslint-disable-next-line complexity
function pickTagId(nextVersion: string): string {
  logger.log(`Picking tag id. Current branch: ${CURRENT_BRANCH}`);

  if (isReleaseBranch) {
    return nextVersion;
  }

  const commitHash = (GITHUB_SHA ?? 'local').substring(0, 4);

  // get the current date in the following format: YYYYMMDD
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const nextHash = `${date}-${commitHash}`;

  if (isNextBranch) {
    return getTag(nextVersion, release_tags.NEXT, nextHash);
  }

  if (isIntegrationBranch) {
    return getTag(nextVersion, release_tags.DEV, nextHash);
  }

  if (isNightlyBranch) {
    return getTag(nextVersion, release_tags.NIGHTLY, nextHash);
  }

  if (isLatestBranch) {
    return getTag(nextVersion, release_tags.NEXT, nextHash);
  }

  throw Error('pickTagId: Encountered an unexpected input.');
}

function getTag(...keywords: Array<string | undefined>): string {
  return keywords.filter(Boolean).join('-');
}
