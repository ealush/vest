const path = require('path');

const exec = require('vx/exec');
const opts = require('vx/opts');
const packageName = require('vx/packageName');
const vxPath = require('vx/vxPath');

const configOpt = `--config ${path.resolve(
  vxPath.JEST_CONFIG_PATH,
  opts.fileNames.JEST_CONFIG
)}`;

function test({ options }) {
  const pkgName = packageName();

  exec([
    'jest',
    pkgName && `--rootDir ${vxPath.package(pkgName)}`,
    configOpt,
    options,
  ]);
}

module.exports = test;
