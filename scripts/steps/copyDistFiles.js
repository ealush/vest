const { copySync, pathExistsSync } = require('fs-extra');
const { packagePath, logger } = require('../../util');

function copyDistFiles(packageName) {
  logger.info('📑 Copying distribution files');

  const distPath = packagePath(packageName, 'dist');

  if (pathExistsSync(distPath)) {
    copySync(distPath, packagePath(packageName));
  }
}

module.exports = copyDistFiles;
