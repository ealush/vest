const path = require('path');

const glob = require('glob');

const opts = require('vx/opts');
const { usePackage } = require('vx/vxContext');
const vxPath = require('vx/vxPath');

function listExportedModules(pkgName = usePackage()) {
  return (
    glob
      .sync(vxPath.packageSrc(pkgName, opts.dir.EXPORTS, '*.ts'))
      .map(f => path.basename(f, '.ts')) ?? []
  );
}

module.exports = listExportedModules;
