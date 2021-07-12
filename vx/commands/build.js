const exec = require('vx/exec');

function build(packageName, { options }) {
  if (packageName) {
    exec([`yarn workspace ${packageName} vx pack`, options]);
  } else {
    exec([`yarn workspaces run vx pack`, options]);
  }
}

module.exports = build;
