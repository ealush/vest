import cleanupDistFiles from './cleanupDistFiles.js';

import exec from 'vx/exec.js';
import * as logger from 'vx/logger.js';
import { usePackage } from 'vx/vxContext.js';
import vxPath from 'vx/vxPath.js';

export type BuildPackageOptions = {
  cliOptions?: string;
};

export default function buildPackage(options: BuildPackageOptions = {}): void {
  const name = usePackage();

  if (!name) {
    throw new Error('No package selected for build.');
  }

  logger.info(`🛠 Building package: ${name}`);

  cleanupDistFiles(name);

  const packageDir = vxPath.package(name);
  const prevEnv = process.env.PACKAGE_DIR;
  process.env.PACKAGE_DIR = packageDir;

  const tsdownArgs = [
    `./node_modules/.bin/tsdown --config ${vxPath.tsdownConfigPath}`,
    options.cliOptions,
  ];

  try {
    exec(tsdownArgs, {
      env: {
        ...process.env,
        NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ''} --loader ${vxPath.TS_LOADER_PATH}`,
      },
    });
  } finally {
    if (prevEnv === undefined) {
      delete process.env.PACKAGE_DIR;
    } else {
      process.env.PACKAGE_DIR = prevEnv;
    }
  }
}
