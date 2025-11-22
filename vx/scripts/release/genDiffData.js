import { inc } from 'semver';

import { release_tags } from '../../opts.js';
import packageJson from '../../util/packageJson.js';
import {
  isIntegrationBranch,
  isReleaseBranch,
  isNextBranch,
  isReleaseKeepVersionBranch,
  isNightlyBranch,
  CURRENT_BRANCH,
} from '../../util/taggedBranch.js';
import { usePackage } from '../../vxContext.js';

import determineChangeLevel from './determineChangeLevel.js';

import * as logger from 'vx/logger.js';

const { GITHUB_SHA } = process.env;

/**
 * @typedef {Object} DiffData
 * @property {string} changeLevel Semver change level (major/minor/patch).
 * @property {string[]} messages Commit messages.
 * @property {string} nextVersion Next semantic version.
 * @property {string | undefined} packageName Name of the package being released.
 * @property {string | undefined} tag Distribution tag (e.g., 'next', 'dev').
 * @property {string} tagId Full tag identifier.
 * @property {string} version Current version.
 * @property {string} versionToPublish Version string to publish to npm.
 */

// commits: [{title: "...", files: ["..."]}]
/**
 * Generates release metadata for the current package based on commit history.
 * @param {{ title: string, files?: string[] }[]} commits Commits affecting the package.
 * @returns {DiffData} Computed diff data.
 */
function genDiffData(commits) {
  const version = packageJson().version;
  const messages = commits.map(({ title }) => title);
  const changeLevel = determineChangeLevel(...messages);
  const nextVersion = inc(version, changeLevel);
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

/**
 * Determines a tag identifier based on branch and version.
 * @param {string} nextVersion Proposed next version.
 * @returns {string} Tag identifier or version string.
 */
function pickTagId(nextVersion) {
  logger.log(`Picking tag id. Current branch: ${CURRENT_BRANCH}`);

  if (isReleaseBranch) {
    return nextVersion;
  }

  const commitHash = GITHUB_SHA.substr(0, 4);

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

  throw Error('pickTagId: Encountered an unexpected input.');
}

/**
 * Joins tag keywords with hyphens while skipping falsy values.
 * @param {...string | undefined} keywords Tag parts.
 * @returns {string}
 */
function getTag(...keywords) {
  return keywords.filter(Boolean).join('-');
}
