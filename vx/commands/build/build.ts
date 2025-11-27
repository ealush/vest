import buildPackage from '../../scripts/build/buildPackage.js';

import exec from 'vx/exec.js';
import { usePackage } from 'vx/vxContext.js';
import vxPath from 'vx/vxPath.js';
// typecheck import removed - typecheck now runs separately after build

export type BuildOptions = {
  cliOptions?: string;
};

export default function build(options: BuildOptions = {}): void {
  // typecheck(); // Commented out: runs before packages are built, causing module resolution errors

  const packageName = usePackage();

  // If a package context is set, build only that package (used by release flow).
  if (packageName) {
    buildPackage(options);
    return;
  }

  // Otherwise build the whole workspace in one go.
  exec(
    [
      './node_modules/.bin/tsdown --config tsdown.workspace.ts',
      options.cliOptions,
    ],
    {
      env: {
        ...process.env,
        NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ''} --loader ${vxPath.TS_LOADER_PATH}`,
      },
    },
  );
}
