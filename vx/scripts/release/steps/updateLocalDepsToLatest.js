const fse = require('fs-extra');

const logger = require('vx/logger');
const packageNames = require('vx/packageNames');
const packageJson = require('vx/util/packageJson');
const vxPath = require('vx/vxPath');

// eslint-disable-next-line complexity
module.exports = function updateLocalDepsToLatest() {
  logger.log('Updating local dependencies to latest version');
  const pkgJson = packageJson();
  const deps = pkgJson.dependencies;

  if (!deps) {
    return;
  }

  for (const name in packageNames.names) {
    if (!deps[name]) {
      continue;
    }

    const depPkgJson = packageJson(name);

    if (depPkgJson && depPkgJson.name === name) {
      deps[name] = depPkgJson.version;
    }
  }

  fse.writeJSONSync(vxPath.packageJson(), pkgJson, {
    spaces: 2,
  });
};
