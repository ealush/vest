const exec = require('vx/exec');

module.exports = function precommit() {
  exec('npx pretty-quick --staged');
};
