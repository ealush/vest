const path = require('path');

const ctx = require('vx/vxContext');
const vxPath = require('vx/vxPath');

module.exports = function packageName() {
  return ctx.usePackage() ?? process.env.VX_PACKAGE_NAME; // VX_PACKAGE_NAME is only used by rollup (buildPackage.js)
};

module.exports.main = function () {
  const packageJson = require(path.resolve(vxPath.ROOT_PATH, 'package.json'));

  return packageJson.vx.main;
};
