const fse = require('fs-extra');

const packageName = require('vx/packageName');

const vxPath = require('vx/vxPath');

module.exports = function copyDist(name = packageName()) {
  fse.copy(vxPath.packageDist(name), vxPath.package(name));
};
