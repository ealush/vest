const path = require('path');

const exec = require('vx/exec');

/**
 * Runs the interactive vx init prompt.
 * @param {{ cliOptions?: string }} param0 Additional CLI options forwarded to the prompt.
 */
module.exports = function init({ cliOptions }) {
  exec(['node', path.resolve(__dirname, './prompt'), cliOptions]);
};
