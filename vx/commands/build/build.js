import buildPackage from '../../scripts/build/buildPackage.js';
import { usePackage } from '../../vxContext.js';
// typecheck import removed - typecheck now runs separately after build

import exec from 'vx/exec.js';

/**
 * Builds either the active package or the entire workspace.
 * @param {{ cliOptions?: string }} [options] Optional command-line options forwarded to underlying tools.
 * @returns {void}
 */

export default function build(options = {}) {
  // typecheck(); // Commented out: runs before packages are built, causing module resolution errors

  const packageName = usePackage();

  // If a package context is set, build only that package (used by release flow).
  if (packageName) {
    buildPackage(options);
    return;
  }

  // Otherwise build the whole workspace in one go.
  exec([
    './node_modules/.bin/tsdown --config tsdown.workspace.ts',
    options.cliOptions,
  ]);
}
