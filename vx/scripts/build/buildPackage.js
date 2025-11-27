import cleanupDistFiles from './cleanupDistFiles.js';

import exec from 'vx/exec.js';
import * as logger from 'vx/logger.js';
import { usePackage } from 'vx/vxContext.js';
import vxPath from 'vx/vxPath.js';

/**
 * Builds the currently scoped package with tsdown.
 * @param {{ cliOptions?: string }} [options] Optional CLI options appended to tsdown.
 */
export default function buildPackage(options = {}) {
  const name = usePackage();
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
    exec(tsdownArgs);
  } finally {
    if (prevEnv === undefined) {
      delete process.env.PACKAGE_DIR;
    } else {
      process.env.PACKAGE_DIR = prevEnv;
    }
  }
}
