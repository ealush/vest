const buildPackage = require('../scripts/build/buildPackage');

const packageName = require('vx/packageName');

function build(name = packageName(), { options }) {
  if (!name) {
    throw new Error('buildPackage must be called with a package name!');
  }

  buildPackage(name, { options });
}

module.exports = build;
