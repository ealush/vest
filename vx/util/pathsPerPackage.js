const path = require('path');

const glob = require('glob');

const opts = require('vx/opts');
const vxPath = require('vx/vxPath');

/**
 * @typedef {Object} PackageModule
 * @property {string} absolute Absolute path to the module file.
 * @property {string} name Module name without extension.
 * @property {string} package Owning package name.
 * @property {string} relative Relative path from repository root.
 */

/** @typedef {{ packageName: string, modules: PackageModule[] }} PackageModulesEntry */

const matches = glob.sync(vxPath.rel(vxPath.packageSrc('*', '**/*.ts')), {
  cwd: vxPath.ROOT_PATH,
  absolute: false,
  ignore: [
    vxPath.rel(vxPath.packageSrc('*', '**/*/index.ts')),
    `**/${opts.dir.TESTS}/**`,
  ],
});

const groupedMatches = matches.reduce((acc, relative) => {
  const name = path.basename(relative, '.ts');
  const package = vxPath.packageNameFromPath(relative);
  const absolute = path.join(vxPath.ROOT_PATH, relative);

  /** @type {PackageModule} */
  const moduleData = {
    absolute,
    name,
    package,
    relative,
  };

  acc[package] = (acc[package] || []).concat(moduleData);
  return acc;
}, {});

const list = Object.entries(groupedMatches).map(([packageName, modules]) => ({
  packageName,
  modules,
}));

findDuplicates();

module.exports = {
  packages: groupedMatches,
  list,
  genPathsPerPackage,
};

/**
 * Ensures there are no duplicate module names within a package.
 * @throws {Error} When duplicates are detected.
 */
function findDuplicates() {
  const duplicatesContainer = list.reduce((acc, package) => {
    const baseline = new Set();
    const duplicates = new Set();

    acc[package.packageName] = {
      baseline,
      duplicates,
    };

    package.modules.forEach(({ name }) => {
      if (baseline.has(name)) {
        duplicates.add(name);
      }
      baseline.add(name);
    });

    return acc;
  }, {});

  const duplicatesPerPackage = [];

  for (const [packageName, { duplicates }] of Object.entries(
    duplicatesContainer,
  )) {
    if (duplicates.size > 0) {
      duplicatesPerPackage.push(
        `${packageName}: ${[...duplicates].map(dup => `\n   -${dup}`).join('')}`,
      );
    }
  }

  if (duplicatesPerPackage.length > 0) {
    throw new Error(
      `VX: Duplicates found in the following packages:\n\n${duplicatesPerPackage.join(
        '\n',
      )}\n`,
    );
  }
}

/**
 * Creates a paths map for the requested package.
 * @param {string} packageName Target package name.
 * @param {{ addPathToArray?: boolean }} options Whether to wrap each path in an array (tsconfig `paths` format).
 * @returns {Record<string, string | string[]>} Map of module names to relative paths.
 */
function genPathsPerPackage(packageName, { addPathToArray = false }) {
  const packageData = groupedMatches[packageName];

  return packageData.reduce((paths, currentModule) => {
    const filePath = vxPath.rel(
      currentModule.absolute,
      vxPath.package(packageName),
    );

    return Object.assign(paths, {
      [currentModule.name]: addPathToArray ? [filePath] : filePath,
    });
  }, {});
}
