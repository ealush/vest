module.exports = function packageName() {
  return process.env.VX_PACKAGE_NAME ?? process.env.npm_package_name;
};

module.exports.setPackageName = function (name) {
  process.env.VX_PACKAGE_NAME = name;
};
