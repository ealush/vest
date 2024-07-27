const { glob } = require('glob');
const { memoize } = require('lodash');

const packageJson = require('vx/util/packageJson');
const packageList = require('vx/util/packageList');

// Takes import map and turns it into a dependency map
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

function buildDepsTree() {
  return packageList.names.reduce(
    (deps, packageName) => buildDepsMemo(packageName, deps),
    {},
  );
}

// Sorts an array of packages by their dependency depth
function sortDependencies(packagesList) {
  const deps = buildDepsTree();

  return packagesList.sort(
    (a, b) => countMaxDepth(deps[b]) - countMaxDepth(deps[a]),
  );
}

// eslint-disable-next-line complexity
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
const countMaxDepth = memoize(function countMaxDepth(node) {
  const keys = Object.keys(node);
  if (keys.length === 0) {
    return 0;
  }

  return 1 + Math.max(...keys.map(k => countMaxDepth(node[k])));
});
