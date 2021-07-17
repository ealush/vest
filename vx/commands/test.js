const path = require('path');

const exec = require('vx/exec');
const vxPath = require('vx/vxPath');

const configOpt = `--config ${path.resolve(
  vxPath.JEST_CONFIG_PATH,
  'jest.config.js'
)}`;

function test(packageName, { options }) {
  if (packageName) {
    exec([`yarn workspace ${packageName} jest`, configOpt, options]);
  } else {
    exec(['jest', configOpt, options]);
  }
}

module.exports = test;
