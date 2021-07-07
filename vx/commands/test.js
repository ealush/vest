const path = require('path');

const exec = require('vx/exec');
const vxPath = require('vx/vxPath');

const configOpt = `--config ${path.resolve(
  vxPath.JEST_CONFIG_PATH,
  'jest.config.js'
)}`;

function test(packageName, { watch }) {
  if (!packageName) {
    exec([`jest ./packages/*`, configOpt, watch && '--watch']);
  } else {
    exec([`yarn workspace ${packageName} jest`, configOpt, watch && '--watch']);
  }
}

module.exports = test;
