const buildPackage = require('vx/scripts/build/buildPackage');
const runOnActivePackages = require('vx/util/runOnActivePackages');

function build(options = {}) {
  runOnActivePackages(buildPackage, options);
}

module.exports = build;
