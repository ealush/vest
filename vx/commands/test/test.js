import path from 'path';

import { usePackage } from '../../vxContext.js';

import exec from 'vx/exec.js';
import vxPath from 'vx/vxPath.js';

const configOpt = `--config ${path.resolve(vxPath.VITEST_CONFIG_FILE_PATH)}`;

/**
 * Runs vitest scoped to the active package when available.
 * @param {{ cliOptions?: string }} param0 Additional CLI options for vitest.
 */

export default function test({ cliOptions }) {
  const pkgName = usePackage();
  exec([
    'yarn vitest',
    pkgName && `--project ${vxPath.package(pkgName)}`,
    configOpt,
    cliOptions,
  ]);
}
