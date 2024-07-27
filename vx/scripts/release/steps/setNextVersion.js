const { writeJSONSync } = require('fs-extra');

const { isReleaseKeepVersionBranch } = require('../../../util/taggedBranch');

const logger = require('vx/logger');
const packageJson = require('vx/util/packageJson');
const { usePackage } = require('vx/vxContext');
const vxPath = require('vx/vxPath');

function setNextVersion({
  tagId,
  tag,
  nextVersion,
  versionToPublish,
  changeLevel,
}) {
  const packageName = usePackage();
  const existingPkgJson = packageJson(packageName);

  if (isReleaseKeepVersionBranch) {
    logger.info(
      `🔢 Skipping version update for ${usePackage()} due to release keep version branch.
      Version being kept: ${existingPkgJson.version}.

      Diff data:
      packageName: ${packageName}
      changeLevel: ${changeLevel}
      tagId: ${tagId}
      tag: ${tag}
      versionToPublish: ${versionToPublish}`,
    );
    return;
  }

  const prevVersion = existingPkgJson.version;

  const nextPackageJson = { ...existingPkgJson, version: versionToPublish };

  existingPkgJson.version = versionToPublish;

  logger.info(
    `🔢 Setting next version for ${usePackage()}. From ${prevVersion} to ${versionToPublish}`,
  );

  writeJSONSync(vxPath.packageJson(packageName), nextPackageJson, {
    spaces: 2,
  });

  const updated = packageJson(packageName);

  if (updated.version !== versionToPublish) {
    logger.error(
      `🚨 Failed to update ${usePackage()} version to: ` + versionToPublish,
    );
    return process.exit(1);
  }
}

module.exports = setNextVersion;
