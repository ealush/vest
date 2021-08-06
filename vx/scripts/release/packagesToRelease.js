const {
  buildDepsTree,
  sortDependencies,
} = require('vx/scripts/release/depsTree');
const listAllChangedPackages = require('vx/scripts/release/github/listAllChangedPackages');

// Gets all the packages that need to be released in the correct order
async function packagesToRelease() {
  const deps = await buildDepsTree();

  const changedPackages = listAllChangedPackages();

  const queue = [...changedPackages];
  const release = new Set();

  while (queue.length) {
    const name = queue.shift();

    if (release.has(name)) {
      continue;
    }

    const dependents = deps[name];

    for (const dep in dependents) {
      queue.push(dep);
    }

    release.add(name);
  }

  const sortedDeps = await sortDependencies([...release]);

  return sortedDeps;
}

module.exports = packagesToRelease;
