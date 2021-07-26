const path = require('path');

const glob = require('glob');

const opts = require('vx/opts');
const packageName = require('vx/packageName');
const vxPath = require('vx/vxPath');

function listExportedModules(pkgName = packageName()) {
  return glob
    .sync(vxPath.packageSrc(pkgName, opts.dir.EXPORTS, '*.ts'))
    .map(f => path.basename(f, '.ts'));
}

module.exports = listExportedModules;
