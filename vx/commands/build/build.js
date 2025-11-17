const exec = require('vx/exec');
const buildPackage = require('vx/scripts/build/buildPackage');
const { usePackage } = require('vx/vxContext');

/**
 * Builds either the active package or the entire workspace.
 * @param {{ cliOptions?: string }} [options] Optional command-line options forwarded to underlying tools.
 * @returns {void}
 */
function build(options = {}) {
  const packageName = usePackage();

  // If a package context is set, build only that package (used by release flow).
  if (packageName) {
    buildPackage(options);
    return;
  }

  // Otherwise build the whole workspace in one go.
  exec([
    './node_modules/.bin/tsdown --config tsdown.workspace.ts',
    options.cliOptions,
  ]);
}

module.exports = build;
