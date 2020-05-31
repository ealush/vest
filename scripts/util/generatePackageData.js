const semver = require('semver');
const { packageJson } = require('../../util');
const { TAG_NEXT } = require('../constants');
const determineChangeLevel = require('./determineChangeLevel');

const {
  TRAVIS_BRANCH,
  DEFAULT_BRANCH,
  NEXT_BRANCH,
  RELEASE_BRANCH,
  TRAVIS_COMMIT,
} = process.env;

function pickTagId(nextVersion) {
  if (TRAVIS_BRANCH === RELEASE_BRANCH) {
    return nextVersion;
  }

  if (TRAVIS_BRANCH === NEXT_BRANCH || TRAVIS_BRANCH !== DEFAULT_BRANCH) {
    return `${nextVersion}-next-${TRAVIS_COMMIT.substr(0, 6)}`;
  }

  throw Error('pickTagId: Encountered an unexpected input.');
}

function generatePackageData(packageName, messages) {
  const version = packageJson(packageName).version;
  const changeLevel = determineChangeLevel(messages.join(''));
  const nextVersion = semver.inc(version, changeLevel);
  const tagId = pickTagId(nextVersion);
  const tag = tagId === nextVersion ? null : TAG_NEXT;
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
