const semver = require('semver');

const determineChangeLevel = require('./determineChangeLevel');
const { TAG_NEXT, TAG_DEV } = require('./releaseKeywords');

const logger = require('vx/logger');
const packageJson = require('vx/util/packageJson');
const {
  isIntegrationBranch,
  isReleaseBranch,
  isNextBranch,
  isReleaseKeepVersionBranch,
} = require('vx/util/taggedBranch');
const { CURRENT_BRANCH } = require('vx/util/taggedBranch');
const { usePackage } = require('vx/vxContext');

const { GITHUB_SHA } = process.env;

// commits: [{title: "...", files: ["..."]}]
function genDiffData(commits) {
  const version = packageJson().version;
  const messages = commits.map(({ title }) => title);
  const changeLevel = determineChangeLevel(...messages);
  const nextVersion = semver.inc(version, changeLevel);
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

module.exports = genDiffData;

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
    return getTag(nextVersion, TAG_NEXT, nextHash);
  }

  if (isIntegrationBranch) {
    return getTag(nextVersion, TAG_DEV, nextHash);
  }

  throw Error('pickTagId: Encountered an unexpected input.');
}

function getTag(...keywords) {
  return keywords.filter(Boolean).join('-');
}
