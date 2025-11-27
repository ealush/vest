import memoize from 'lodash/memoize.js';

import packageJson from 'vx/util/packageJson.js';
import * as packageList from 'vx/util/packageList.js';

export interface DepTree {
  [key: string]: DepTree;
}

// Takes import map and turns it into a dependency map
const buildDepsMemo = memoize(function (
  packageName: string,
  deps: DepTree,
): DepTree {
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

function buildDepsTree(): DepTree {
  return packageList.names.reduce(
    (deps, packageName) => buildDepsMemo(packageName, deps),
    {},
  ) as DepTree;
}

// Sorts an array of packages by their dependency depth
function sortDependencies(packagesList: string[]): string[] {
  const deps = buildDepsTree();

  return packagesList.sort(
    (a, b) => countMaxDepth(deps[b]) - countMaxDepth(deps[a]),
  );
}

function dependsOn(
  a: string,
  b: string,
  tree: DepTree = buildDepsTree(),
  foundB = false,
): boolean {
  return _dependsOnHelper(a, b, tree, foundB);
}

function _dependsOnHelper(
  a: string,
  b: string,
  tree: DepTree,
  foundB: boolean,
): boolean {
  if (a === b) {
    return false;
  }

  if (tree.hasOwnProperty(a) && foundB) {
    return true;
  }

  return _dependsOnAny(a, b, tree, foundB);
}

function _dependsOnAny(a: string, b: string, tree: DepTree, _foundB: boolean) {
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
const countMaxDepth = memoize(function countMaxDepth(node: DepTree): number {
  const keys = Object.keys(node);
  if (keys.length === 0) {
    return 0;
  }

  return 1 + Math.max(...keys.map(k => countMaxDepth(node[k])));
});
