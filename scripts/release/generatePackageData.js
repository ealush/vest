const semver = require('semver');

const { packageJson } = require('../../util');

const determineChangeLevel = require('./determineChangeLevel');
const { TAG_NEXT, TAG_DEV } = require('./releaseKeywords');

const {
  TRAVIS_BRANCH,
  LATEST_BRANCH,
  STABLE_BRANCH,
  RELEASE_BRANCH,
  TRAVIS_COMMIT,
} = process.env;

function pickTagId(nextVersion) {
  if (TRAVIS_BRANCH === RELEASE_BRANCH) {
    return nextVersion;
  }

  const commitHash = TRAVIS_COMMIT.substr(0, 6);

  if (TRAVIS_BRANCH === LATEST_BRANCH) {
    return `${nextVersion}-${TAG_NEXT}-${commitHash}`;
  }

  if (TRAVIS_BRANCH !== STABLE_BRANCH) {
    return `${nextVersion}-${TAG_DEV}-${commitHash}`;
  }

  throw Error('pickTagId: Encountered an unexpected input.');
}

function generatePackageData(packageName, messages) {
  const version = packageJson(packageName).version;
  const changeLevel = determineChangeLevel(messages.join(''));
  const nextVersion = semver.inc(version, changeLevel);
  const tagId = pickTagId(nextVersion);
  const [, tag] = tagId.split('-');
  return {
    changeLevel,
    messages,
    nextVersion,
    packageName,
    tag,
    tagId,
    version,
  };
}

module.exports = generatePackageData;
