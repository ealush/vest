import fse from 'fs-extra';

import * as logger from 'vx/logger.js';
import packageJson from 'vx/util/packageJson.js';
import { isReleaseKeepVersionBranch } from 'vx/util/taggedBranch.js';
import { usePackage } from 'vx/vxContext.js';
import vxPath from 'vx/vxPath.js';

type VersionData = {
  tagId: string;
  tag?: string;
  versionToPublish: string;
  changeLevel: string;
};

function setNextVersion({
  tagId,
  tag,
  versionToPublish,
  changeLevel,
}: VersionData): void {
  const packageName = usePackage();

  if (!packageName) {
    throw new Error('Package context is required to set version.');
  }

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

  fse.writeJSONSync(vxPath.packageJson(packageName), nextPackageJson, {
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

export default setNextVersion;
