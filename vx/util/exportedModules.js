const path = require('path');

const glob = require('glob');

const opts = require('vx/opts');
const { usePackage } = require('vx/vxContext');
const vxPath = require('vx/vxPath');

const namespaceDelimiter = '@';

/**
 * Formats a module name with an optional namespace.
 * @param {string | undefined} namespace Optional export namespace.
 * @param {string} moduleName Module basename.
 * @returns {string} Namespaced module identifier.
 */
function getExportedModuleNames(namespace, moduleName) {
  return [namespace, moduleName].filter(Boolean).join(namespaceDelimiter);
}

/**
 * Lists exported modules for a package.
 * @param {string} [pkgName] Package name to inspect; defaults to active context.
 * @returns {Array<[string, string | undefined]>} Array of `[moduleName, namespace]` tuples.
 */
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
