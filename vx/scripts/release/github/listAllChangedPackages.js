const path = require('path');

const listAllChangesSinceStableBranch = require('./listAllChangesSinceStableBranch');

const opts = require('vx/opts');
const packageNames = require('vx/packageNames');

function listAllChangedPackages() {
  const changes = listAllChangesSinceStableBranch();
  return Object.keys(
    changes.reduce((packages, { files = [] }) => {
      return files.reduce((packages, file) => {
        if (!file.startsWith(opts.dir.PACKAGES)) {
          return packages;
        }

        const [, packageName] = file.split(path.sep);

        if (!packageNames.names[packageName]) {
          return packages;
        }
        packages[packageName] = packages[packageName] || true;

        return packages;
      }, packages);
    }, {})
  );
}

module.exports = listAllChangedPackages;
