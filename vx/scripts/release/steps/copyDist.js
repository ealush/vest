const fse = require('fs-extra');

const logger = require('vx/logger');
const packageName = require('vx/packageName');
const dryRun = require('vx/util/dryRun');
const vxPath = require('vx/vxPath');

module.exports = function copyDist(name = packageName()) {
  const from = vxPath.packageDist(name);
  const to = vxPath.package(name);

  logger.info(`Copying dist files of package ${name} from ${from} to ${to}`);

  if (dryRun.isDryRun()) {
    return dryRun.dryRunExitMessage(copyDist);
  }

  fse.copy(from, to);
};
