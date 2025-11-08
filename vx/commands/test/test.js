const path = require('path');

const exec = require('vx/exec');
const { usePackage } = require('vx/vxContext');
const vxPath = require('vx/vxPath');

const configOpt = `--config ${path.resolve(vxPath.VITEST_CONFIG_FILE_PATH)}`;

function test({ cliOptions }) {
  const pkgName = usePackage();

  exec([
    'yarn vitest',
    pkgName && `--project ${vxPath.package(pkgName)}`,
    configOpt,
    cliOptions,
  ]);
}

module.exports = test;
