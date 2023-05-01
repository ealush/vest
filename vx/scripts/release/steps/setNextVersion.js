const { writeJSONSync } = require('fs-extra');

const logger = require('vx/logger');
const packageJson = require('vx/util/packageJson');
const { usePackage } = require('vx/vxContext');
const vxPath = require('vx/vxPath');

function setNextVersion({ tagId, tag, nextVersion }) {
  const packageName = usePackage();
  const existingPkgJson = packageJson(packageName);

  const prevVersion = existingPkgJson.version;

  nextVersion = tag ? tagId : nextVersion;

  const nextPackageJson = { ...existingPkgJson, version: nextVersion };

  existingPkgJson.version = nextVersion;

  logger.info(
    `🔢 Setting next version for ${usePackage()}. From ${prevVersion} to ${nextVersion}`
  );

  writeJSONSync(vxPath.packageJson(packageName), nextPackageJson, {
    spaces: 2,
  });

  const updated = packageJson(packageName);

  if (updated.version !== nextVersion) {
    logger.error(
      `🚨 Failed to update ${usePackage()} version to: ` + nextVersion
    );
    return process.exit(1);
  }
}

module.exports = setNextVersion;
