const exec = require('vx/exec');

/**
 * Runs formatting on staged files before commit.
 */
module.exports = function precommit() {
  exec('npx pretty-quick --staged');
};
