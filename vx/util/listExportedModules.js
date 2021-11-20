const path = require('path');

const glob = require('glob');

const opts = require('vx/opts');
const { usePackage } = require('vx/vxContext');
const vxPath = require('vx/vxPath');

function listExportedModules(pkgName = usePackage()) {
  return (
    glob.sync(vxPath.packageSrc(pkgName, opts.dir.EXPORTS, '*.ts')).map(f => {
      const [moduleName, namespace] = path
        .basename(f, '.ts')
        .split('@')
        .reverse();
      return [moduleName, namespace];
    }) ?? []
  );
}

module.exports = listExportedModules;
