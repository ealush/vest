const { copySync, pathExistsSync } = require('fs-extra');
const { packagePath } = require('../../util');

function copyDistFiles({ packageName }) {
  const distPath = packagePath(packageName, 'dist');
  if (!pathExistsSync(distPath)) {
    return;
  }

  copySync(distPath, packagePath(packageName));
}

module.exports = copyDistFiles;
