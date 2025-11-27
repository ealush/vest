import path from 'path';

import exec from 'vx/exec.js';
import { usePackage } from 'vx/vxContext.js';
import vxPath from 'vx/vxPath.js';

const configOpt = `--config ${path.resolve(vxPath.VITEST_CONFIG_FILE_PATH)}`;

export type TestOptions = { cliOptions?: string };

export default function test({ cliOptions }: TestOptions = {}): void {
  const pkgName = usePackage();
  exec([
    'yarn vitest',
    pkgName && `--project ${vxPath.package(pkgName)}`,
    configOpt,
    cliOptions,
  ]);
}
