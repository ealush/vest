const exec = require('vx/exec');

function build(packageName, { options }) {
  if (packageName) {
    exec([`yarn workspace ${packageName} vx buildPackage`, options]);
  } else {
    exec([`yarn workspaces run vx buildPackage`, options]);
  }
}

module.exports = build;
