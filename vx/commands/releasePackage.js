const releaseScript = require('../scripts/release/releasePackage');

const packageName = require('vx/packageName');

function releasePackage(name = packageName(), { options }) {
  if (!name) {
    throw new Error('releasePackage must be called with a package name!');
  }

  releaseScript(name, { options });
}

module.exports = releasePackage;
