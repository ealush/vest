const path = require('path');

const exec = require('vx/exec');
const opts = require('vx/opts');
const { usePackage } = require('vx/vxContext');
const vxPath = require('vx/vxPath');

const configOpt = `--config ${path.resolve(
  vxPath.JEST_CONFIG_PATH,
  opts.fileNames.JEST_CONFIG
)}`;

function test({ options }) {
  const pkgName = usePackage();

  exec([
    'jest',
    pkgName && `--rootDir ${vxPath.package(pkgName)}`,
    configOpt,
    options,
  ]);
}

module.exports = test;
