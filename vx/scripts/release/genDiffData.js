const semver = require('semver');

const packageJson = require('../../util/packageJson');

const determineChangeLevel = require('./determineChangeLevel');
const { TAG_NEXT, TAG_DEV } = require('./releaseKeywords');

const logger = require('vx/logger');
const { usePackage } = require('vx/vxContext');

const {
  CURRENT_BRANCH,
  LATEST_BRANCH,
  STABLE_BRANCH,
  RELEASE_BRANCH,
  GITHUB_SHA,
} = process.env;

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
  };
}

module.exports = genDiffData;

function pickTagId(nextVersion) {
  logger.log(`Picking tag id. Current branch: ${CURRENT_BRANCH}`);

  if (CURRENT_BRANCH === RELEASE_BRANCH) {
    return nextVersion;
  }

  const commitHash = GITHUB_SHA.substr(0, 6);

  if (CURRENT_BRANCH === LATEST_BRANCH) {
    return `${nextVersion}-${TAG_NEXT}-${commitHash}`;
  }

  if (CURRENT_BRANCH !== STABLE_BRANCH) {
    return `${nextVersion}-${TAG_DEV}-${commitHash}`;
  }

  throw Error('pickTagId: Encountered an unexpected input.');
}
