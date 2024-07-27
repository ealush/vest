const fse = require('fs-extra');

const { TAG_NEXT, TAG_DEV } = require('../releaseKeywords');

const logger = require('vx/logger');
const packageNames = require('vx/packageNames');
const packageJson = require('vx/util/packageJson');
const {
  isNextBranch,
  isIntegrationBranch,
  targetPackage,
} = require('vx/util/taggedBranch');
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
      // If we have a "targetPackage", we might not be building our dependencies, so start with
      // taking the latest from the current tag. Might not be perfect, but since this is mostly
      // used for development or "next", it's not too bad, and we're defaulting to the latest
      // regardless.
      if (targetPackage) {
        deps[name] = isNextBranch
          ? TAG_NEXT
          : isIntegrationBranch
            ? TAG_DEV
            : depPkgJson.version;
      } else {
        deps[name] =
          isNextBranch || isIntegrationBranch
            ? depPkgJson.version // In development we want to use the specific version
            : `^${depPkgJson.version}`; // In production we want to use the latest version within range
      }
    }
  }

  fse.writeJSONSync(vxPath.packageJson(), pkgJson, {
    spaces: 2,
  });
};
