const path = require('path');

const { memoize } = require('lodash');
const madge = require('madge');

const opts = require('vx/opts');
const vxPath = require('vx/vxPath');

// Takes import map and turns it into a dependency map
const buildDepsTree = memoize(async function buildDepsTree() {
  const baseTree = (await getAllDeps()).tree;

  const depTree = {};
  for (const file in baseTree) {
    const [packageName] = file.split(path.sep);
    depTree[packageName] = depTree[packageName] ?? {};
    baseTree[file].forEach(dep => {
      const [depName] = dep.split(path.sep);

      if (depName === packageName) {
        return;
      }
      depTree[depName] = depTree[depName] || {};

      if (!depTree[depName][packageName]) {
        depTree[depName][packageName] = depTree[packageName];
      }
    });
  }
  return depTree;
});

// Sorts an array of packages by their dependency depth
async function sortDependencies(packagesList) {
  const deps = await buildDepsTree();

  return packagesList.sort(
    (a, b) => countMaxDepth(deps[b]) - countMaxDepth(deps[a])
  );
}

module.exports = { buildDepsTree, sortDependencies };

// Uses madge to get all the packages. Note: must be run from the root of the repo.
const getAllDeps = memoize(function getAllDeps() {
  return madge(vxPath.PACKAGES_PATH, {
    excludeRegExp: [`${opts.dir.TESTS}|.d.ts|shared`, /^((?!src).)*$/],
    fileExtensions: ['ts'],
    tsConfig: vxPath.TSCONFIG_PATH,
  });
});

// Counts max dependency depth
const countMaxDepth = memoize(function countMaxDepth(node) {
  const keys = Object.keys(node);
  if (keys.length === 0) {
    return 0;
  }

  return 1 + Math.max(...keys.map(k => countMaxDepth(node[k])));
});
