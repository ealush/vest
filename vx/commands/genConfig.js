const exec = require('vx/exec');
const vxPath = require('vx/vxPath');

module.exports = () => {
  exec(`node ${vxPath.VX_SCRIPTS_PATH}/genTsConfig.js`);
};
