const buildPackage = require('../scripts/build/buildPackage');

const packageName = require('vx/packageName');

function pack(name = packageName(), { options }) {
  if (!name) {
    throw new Error('pack must be called with a package name!');
  }

  buildPackage(name, { options });
}

module.exports = pack;
