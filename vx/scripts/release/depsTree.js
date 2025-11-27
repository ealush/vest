import lodash from 'lodash';

import packageJson from 'vx/util/packageJson.js';
import * as packageList from 'vx/util/packageList.js';

const { memoize } = lodash;

// Takes import map and turns it into a dependency map
/**
 * Builds dependency entries for a given package.
 * @param {string} packageName Package name to process.
 * @param {Record<string, Record<string, any>>} deps Accumulator dependency tree.
 * @returns {Record<string, Record<string, any>>}
 */
const buildDepsMemo = memoize(function (packageName, deps) {
  const pkgJson = packageJson(packageName);

  // This doesn't really do much, only prevent a circular dependency tree which countMaxDepth can't handle
  deps[packageName] = deps[packageName] || {};

  const dependencies = Object.keys(pkgJson.dependencies || {});

  dependencies.forEach(dependency => {
    deps[dependency] = deps[dependency] || {};
    deps[dependency][packageName] =
      deps[packageName] ?? buildDepsMemo(dependency, deps);
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

/**
 * Checks whether package `a` depends (directly or indirectly) on package `b`.
 * @param {string} a Package to check.
 * @param {string} b Potential dependency.
 * @param {Record<string, Record<string, any>>} [tree=buildDepsTree()] Dependency tree.
 * @param {boolean} [foundB=false] Internal flag used during traversal.
 * @returns {boolean}
 */
function dependsOn(a, b, tree = buildDepsTree(), foundB = false) {
  return _dependsOnHelper(a, b, tree, foundB);
}

/**
 * Internal helper for dependsOn check.
 * @param {string} a Package to check.
 * @param {string} b Potential dependency.
 * @param {Record<string, Record<string, any>>} tree Dependency tree.
 * @param {boolean} foundB Whether package b has been found.
 * @returns {boolean}
 */
function _dependsOnHelper(a, b, tree, foundB) {
  if (a === b) {
    return false;
  }

  if (tree.hasOwnProperty(a) && foundB) {
    return true;
  }

  return _dependsOnAny(a, b, tree, foundB);
}

/**
 * Checks if package a depends on b in any subtree.
 * @param {string} a Package to check.
 * @param {string} b Potential dependency.
 * @param {Record<string, Record<string, any>>} tree Dependency tree.
 * @param {boolean} _foundB Whether package b has been found (unused in this function).
 * @returns {boolean}
 */
function _dependsOnAny(a, b, tree, _foundB) {
  for (const dep in tree) {
    const res = _dependsOnHelper(a, b, tree[dep], dep === b);
    if (res) {
      return true;
    }
  }
  return false;
}

export { buildDepsTree, sortDependencies, dependsOn };

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
