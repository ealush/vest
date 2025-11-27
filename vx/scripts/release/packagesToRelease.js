import { buildDepsTree, sortDependencies } from './depsTree.js';
import listAllChangedPackages from './github/listAllChangedPackages.js';

import * as logger from 'vx/logger.js';
import * as packageNames from 'vx/packageNames.js';

// Gets all the packages that need to be released in the correct order
// eslint-disable-next-line complexity
/**
 * Produces the list of packages to release in dependency-safe order.
 * @returns {{ packageListToRelease: string[], isTopLevelChange: boolean }}
 */
function packagesToRelease() {
  const deps = buildDepsTree();
  const changedPackagesSet = listAllChangedPackages();
  const isTopLevelChange = changedPackagesSet.size === 0;
  const changedPackagesArray = Array.from(changedPackagesSet);
  const release = new Set();
  const unchangedDependents = new Set();

  handleInitialLogging(
    isTopLevelChange,
    changedPackagesSet,
    release,
    changedPackagesArray,
  );
  processReleaseQueue(deps, {
    changedPackagesArray,
    changedPackagesSet,
    release,
    unchangedDependents,
  });
  logUnchangedDependents(unchangedDependents);

  const allPackagesToRelease = sortDependencies([...release]);
  logger.info(
    `\u2705 The packages will be released in the following order: \n  - ${allPackagesToRelease.join(
      '\n  - ',
    )}\n`,
  );
  return {
    packageListToRelease: allPackagesToRelease,
    isTopLevelChange,
  };
}

/**
 * Handles initial logging and populates release set for top-level changes.
 * @param {boolean} isTopLevelChange Whether this is a workspace-level change.
 * @param {Set<string>} changedPackagesSet Set of changed packages.
 * @param {Set<string>} release Set of packages to release.
 * @param {string[]} changedPackagesArray Array of changed package names.
 * @returns {void}
 */
function handleInitialLogging(
  isTopLevelChange,
  changedPackagesSet,
  release,
  changedPackagesArray,
) {
  if (isTopLevelChange) {
    logger.info(`💡 No packages were changed \n`);
    packageNames.list.forEach(packageName => {
      changedPackagesSet.add(packageName);
      release.add(packageName);
    });
  } else {
    logger.info(
      `💡 The following packages were changed: \n  - ${changedPackagesArray.join(
        '\n  - ',
      )}\n`,
    );
  }
}

/**
 * Processes the release queue to find all packages that need releasing.
 * @param {Record<string, Record<string, any>>} deps Dependency tree.
 * @param {{ changedPackagesSet: Set<string>, release: Set<string>, changedPackagesArray: string[], unchangedDependents: Set<string> }} options Processing options.
 * @returns {void}
 */
function processReleaseQueue(
  deps,
  { changedPackagesSet, release, changedPackagesArray, unchangedDependents },
) {
  const queue = [...changedPackagesArray];
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
}

/**
 * Logs packages that will be released due to dependency changes.
 * @param {Set<string>} unchangedDependents Set of unchanged dependent packages.
 * @returns {void}
 */
function logUnchangedDependents(unchangedDependents) {
  if (unchangedDependents.size) {
    logger.info(
      `🧱 The following packages did not change, but will be released because they are indirectly impacted by changes: \n  - ${[
        ...unchangedDependents,
      ].join('\n  - ')} \n`,
    );
  }
}

export default packagesToRelease;
