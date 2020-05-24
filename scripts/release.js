const { asyncForeach, logger } = require('../util');
const buildPackage = require('./steps/buildPackage');
const copyDistFiles = require('./steps/copyDistFiles');
const publishPackage = require('./steps/publishPackage');
const pushToDefaultBranch = require('./steps/pushToDefaultBranch');
const setNextVersion = require('./steps/setNextVersion');
const updateChangelog = require('./steps/updateChangelog');
const updateDocs = require('./steps/updateDocs');
const createRelease = require('./util/createRelease');
const generatePackageData = require('./util/generatePackageData');
const getDiff = require('./util/getDiff');

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
    buildPackage(packageData);
    copyDistFiles(packageData);
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

  pushToDefaultBranch(packageData, allMessages);

  await asyncForeach(packageData, async packageData => {
    await createRelease({
      tag: packageData.nextVersion,
      release: packageData.release,
    });
  });
};

run();
