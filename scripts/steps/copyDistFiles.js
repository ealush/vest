const path = require('path');
const { copySync, pathExistsSync } = require('fs-extra');
const glob = require('glob');

const { packagePath, logger } = require('../../util');

function copyDistFiles(packageName) {
  logger.info('📑 Copying distribution files');

  // Gather all non-spec type declarations from the package
  // And copy them over to the root folder
  // This is good enough until I add a ts build
  glob
    .sync('src/typings/*.d.ts', {
      cwd: packagePath(packageName),
      absolute: true,
      ignore: '**/spec/*',
    })
    .forEach(filePath => {
      copySync(filePath, packagePath(packageName, path.basename(filePath)));
    });

  // Copy all distribution files into root folder
  const distPath = packagePath(packageName, 'dist');

  if (pathExistsSync(distPath)) {
    copySync(distPath, packagePath(packageName));
  }
}

module.exports = copyDistFiles;
