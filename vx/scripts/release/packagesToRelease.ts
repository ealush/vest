import { buildDepsTree, sortDependencies, type DepTree } from './depsTree.js';
import listAllChangedPackages from './github/listAllChangedPackages.js';

import * as logger from 'vx/logger.js';
import { packageNames } from 'vx/packageNames.js';
import { isNightlyBranch } from 'vx/util/taggedBranch.js';

// Gets all the packages that need to be released in the correct order

function packagesToRelease(): {
  packageListToRelease: string[];
  isTopLevelChange: boolean;
} {
  const deps = buildDepsTree();
  const changedPackagesSet = listAllChangedPackages();
  const isTopLevelChange = changedPackagesSet.size === 0;

  if (isNightlyBranch && isTopLevelChange) {
    logger.info(
      '🌙 Nightly branch: No package changes detected since stable. Skipping publish.',
    );
    return { packageListToRelease: [], isTopLevelChange: false };
  }

  const changedPackagesArray = Array.from(changedPackagesSet);
  const release = new Set<string>();
  const unchangedDependents = new Set<string>();

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

function handleInitialLogging(
  isTopLevelChange: boolean,
  changedPackagesSet: Set<string>,
  release: Set<string>,
  changedPackagesArray: string[],
): void {
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

// eslint-disable-next-line complexity
function processReleaseQueue(
  deps: DepTree,
  {
    changedPackagesSet,
    release,
    changedPackagesArray,
    unchangedDependents,
  }: {
    changedPackagesSet: Set<string>;
    release: Set<string>;
    changedPackagesArray: string[];
    unchangedDependents: Set<string>;
  },
): void {
  const queue = [...changedPackagesArray];
  while (queue.length) {
    const name = queue.shift();
    if (!name) {
      continue;
    }
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

function logUnchangedDependents(unchangedDependents: Set<string>): void {
  if (unchangedDependents.size > 0) {
    logger.info(
      `🧱 The following packages did not change, but will be released because they are indirectly impacted by changes: \n  - ${[
        ...unchangedDependents,
      ].join('\n  - ')} \n`,
    );
  }
}

export default packagesToRelease;
