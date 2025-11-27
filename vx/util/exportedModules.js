import { createRequire } from 'module';
import path from 'path';

import { dir } from 'vx/opts.js';
import { usePackage } from 'vx/vxContext.js';
import vxPath from 'vx/vxPath.js';

const require = createRequire(import.meta.url);
const glob = require('glob');

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
    glob.sync(vxPath.packageSrc(pkgName, dir.EXPORTS, '*.ts')).map(f => {
      const [moduleName, namespace] = path
        .basename(f, '.ts')
        .split(namespaceDelimiter)
        .reverse();
      return [moduleName, namespace];
    }) ?? []
  );
}

export { listExportedModules, getExportedModuleNames };
