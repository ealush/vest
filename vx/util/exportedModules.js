const path = require('path');

const glob = require('glob');

const opts = require('vx/opts');
const { usePackage } = require('vx/vxContext');
const vxPath = require('vx/vxPath');

const namespaceDelimiter = '@';

function getExportedModuleNames(namespace, moduleName) {
  return [namespace, moduleName].filter(Boolean).join(namespaceDelimiter);
}

function listExportedModules(pkgName = usePackage()) {
  return (
    glob.sync(vxPath.packageSrc(pkgName, opts.dir.EXPORTS, '*.ts')).map(f => {
      const [moduleName, namespace] = path
        .basename(f, '.ts')
        .split(namespaceDelimiter)
        .reverse();
      return [moduleName, namespace];
    }) ?? []
  );
}

module.exports = {
  listExportedModules,
  getExportedModuleNames,
};
