const releaseScript = require('../scripts/release/releasePackage');

const packageName = require('vx/packageName');

function releasePackage(name = packageName()) {
  if (!name) {
    throw new Error('releasePackage must be called with a package name!');
  }

  releaseScript(name);
}

module.exports = releasePackage;
