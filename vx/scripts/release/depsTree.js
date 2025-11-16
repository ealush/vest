const { memoize } = require('lodash');

const packageJson = require('vx/util/packageJson');
const packageList = require('vx/util/packageList');

// Takes import map and turns it into a dependency map
/**
 * Builds dependency entries for a given package.
 * @param {string} package Package name to process.
 * @param {Record<string, Record<string, any>>} deps Accumulator dependency tree.
 * @returns {Record<string, Record<string, any>>}
 */
const buildDepsMemo = memoize(function (package, deps) {
  const pkgJson = packageJson(package);

  // This doesn't really do much, only prevent a circular dependency tree which countMaxDepth can't handle
  deps[package] = deps[package] || {};

  const dependencies = Object.keys(pkgJson.dependencies || {});

  dependencies.forEach(dependency => {
    deps[dependency] = deps[dependency] || {};
    deps[dependency][package] =
      deps[package] ?? buildDepsMemo(dependency, deps);
  });

  return deps;
});

/**
 * Builds a dependency tree keyed by package names.
 * @returns {Record<string, Record<string, any>>}
 */
function buildDepsTree() {
  return packageList.names.reduce(
    (deps, packageName) => buildDepsMemo(packageName, deps),
    {},
  );
}

// Sorts an array of packages by their dependency depth
/**
 * Sorts packages by dependency depth (dependents later in the array).
 * @param {string[]} packagesList List of package names.
 * @returns {string[]} Sorted packages.
 */
function sortDependencies(packagesList) {
  const deps = buildDepsTree();

  return packagesList.sort(
    (a, b) => countMaxDepth(deps[b]) - countMaxDepth(deps[a]),
  );
}

// eslint-disable-next-line complexity
/**
 * Checks whether package `a` depends (directly or indirectly) on package `b`.
 * @param {string} a Package to check.
 * @param {string} b Potential dependency.
 * @param {Record<string, Record<string, any>>} [tree=buildDepsTree()] Dependency tree.
 * @param {boolean} [foundB=false] Internal flag used during traversal.
 * @returns {boolean}
 */
function dependsOn(a, b, tree = buildDepsTree(), foundB = false) {
  if (a === b) {
    return false;
  }

  if (tree.hasOwnProperty(a) && foundB) {
    return true;
  }

  for (const dep in tree) {
    const res = dependsOn(a, b, tree[dep], dep === b);

    if (res) {
      return true;
    }
  }

  return false;
}

module.exports = {
  buildDepsTree,
  sortDependencies,
  dependsOn,
};

// Counts max dependency depth
/**
 * Counts the maximum dependency depth for a node in the dependency tree.
 * @param {Record<string, any>} node Dependency subtree.
 * @returns {number}
 */
const countMaxDepth = memoize(function countMaxDepth(node) {
  const keys = Object.keys(node);
  if (keys.length === 0) {
    return 0;
  }

  return 1 + Math.max(...keys.map(k => countMaxDepth(node[k])));
});
