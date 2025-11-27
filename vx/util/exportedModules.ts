import { createRequire } from 'module';
import path from 'path';

import { dir } from 'vx/opts.js';
import { usePackage } from 'vx/vxContext.js';
import vxPath from 'vx/vxPath.js';

const require = createRequire(import.meta.url);
const glob: typeof import('glob') = require('glob');

const namespaceDelimiter = '@';

export type ExportedModule = [moduleName: string, namespace?: string];

/**
 * Formats a module name with an optional namespace.
 */
function getExportedModuleNames(
  namespace: string | undefined,
  moduleName: string,
): string {
  return [namespace, moduleName].filter(Boolean).join(namespaceDelimiter);
}

/**
 * Lists exported modules for a package.
 */
function listExportedModules(pkgName = usePackage()): ExportedModule[] {
  return (
    glob.sync(vxPath.packageSrc(pkgName, dir.EXPORTS, '*.ts')).map(f => {
      const [moduleName, namespace] = path
        .basename(f, '.ts')
        .split(namespaceDelimiter)
        .reverse();
      return [moduleName, namespace] as ExportedModule;
    }) ?? []
  );
}

export { listExportedModules, getExportedModuleNames };
