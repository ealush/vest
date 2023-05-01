const path = require('path');

const fse = require('fs-extra');
const glob = require('glob');

const vxPath = require('vx/vxPath');

function cleanupDistFiles(packageName) {
  fse.removeSync(vxPath.packageDist(packageName));

  const exportNames = glob
    .sync(vxPath.packageSrcExports(packageName, '*.ts'))
    .map(f => path.basename(f, '.ts'));

  exportNames.forEach(exportName => {
    fse.removeSync(vxPath.package(packageName, exportName));
  });
}

module.exports = cleanupDistFiles;
