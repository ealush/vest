const exec = require('vx/exec');

function build(packageName, { watch } = {}) {
  if (!packageName) {
    exec([`yarn workspaces run vx buildPackage`, watch && '--watch']);
  } else {
    exec([`yarn workspace ${packageName} vx buildPackage`, watch && '--watch']);
  }
}

module.exports = build;
