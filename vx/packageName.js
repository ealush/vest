const ctx = require('vx/vxContext');

module.exports = function packageName() {
  return ctx.usePackage() ?? process.env.VX_PACKAGE_NAME; // VX_PACKAGE_NAME is only used by rollup (buildPackage.js)
};
