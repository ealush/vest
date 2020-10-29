const { asyncForeach, logger } = require('../util');

const build = require('./build');
const generatePackageData = require('./release/generatePackageData');
const createRelease = require('./release/github/createRelease');
const getDiff = require('./release/github/getDiff');
const publishPackage = require('./release/steps/publishPackage');
const pushToLatestBranch = require('./release/steps/pushToLatestBranch');
const setNextVersion = require('./release/steps/setNextVersion');
const updateChangelog = require('./release/steps/updateChangelog');
const updateDocs = require('./release/steps/updateDocs');

const { TRAVIS_BRANCH, RELEASE_BRANCH } = process.env;

const run = async () => {
  logger.info('🔍 Finding diffs');
  const { changedPackages, allMessages, messagesPerPackage } = await getDiff();

  updateDocs();

  const packageData = changedPackages.map(packageName => {
    logger.info(`Package: 📦 ${packageName}`);

    const packageData = generatePackageData(
      packageName,
      messagesPerPackage[packageName] || []
    );

    setNextVersion(packageData);
    build(packageName);
    publishPackage(packageData);

    // Do not create release if there are no commit
    // Messages related to current package
    if (packageData.messages.length) {
      packageData.release = updateChangelog(packageData);
    }

    return packageData;
  });

  // Do not push to default branch and do not publish a release
  // Unless in release branch
  if (TRAVIS_BRANCH !== RELEASE_BRANCH) {
    return;
  }

  pushToLatestBranch(packageData, allMessages);

  await asyncForeach(packageData, async packageData => {
    await createRelease({
      tag: packageData.nextVersion,
      release: packageData.release,
    });
  });
};

run();
