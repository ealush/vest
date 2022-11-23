const logger = require('vx/logger');
const {
  buildDepsTree,
  sortDependencies,
} = require('vx/scripts/release/depsTree');
const listAllChangedPackages = require('vx/scripts/release/github/listAllChangedPackages');

// Gets all the packages that need to be released in the correct order
// eslint-disable-next-line complexity
function packagesToRelease() {
  const deps = buildDepsTree();

  const changedPackagesSet = listAllChangedPackages();

  const changedPackagesArray = Array.from(changedPackagesSet);
  logger.info(
    `💡 The following packages were changed: \n  - ${changedPackagesArray.join(
      '\n  - '
    )}\n`
  );

  const queue = changedPackagesArray;
  const release = new Set();

  const unchangedDependents = new Set();

  while (queue.length) {
    const name = queue.shift();

    if (release.has(name)) {
      continue;
    }

    const dependents = deps[name];

    for (const dep in dependents) {
      queue.push(dep);

      if (!changedPackagesSet.has(dep)) {
        unchangedDependents.add(dep);
      }
    }

    release.add(name);
  }

  if (unchangedDependents.size) {
    logger.info(
      `🧱 The following packages did not change, but will be released because they depend on changed packages: \n  - ${[
        ...unchangedDependents,
      ].join('\n  - ')} \n`
    );
  }

  const allPackagesToRelease = sortDependencies([...release]);

  logger.info(
    `✅ The packages will be released in the following order: \n  - ${allPackagesToRelease.join(
      '\n  - '
    )}\n`
  );

  return allPackagesToRelease;
}

module.exports = packagesToRelease;
