const exec = require('vx/exec');

function typecheck() {
  exec('tsc --noEmit');
}

module.exports = typecheck;
