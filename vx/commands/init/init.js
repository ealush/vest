const path = require('path');

const exec = require('vx/exec');

module.exports = function init({ cliOptions }) {
  exec(['node', path.resolve(__dirname, './prompt'), cliOptions]);
};
