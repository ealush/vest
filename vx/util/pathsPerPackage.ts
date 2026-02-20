import { createRequire } from 'module';
import { basename, join } from 'path';

import { isNotEmptySet } from 'vest-utils';

import { dir } from 'vx/opts.js';
import vxPath from 'vx/vxPath.js';

const require = createRequire(import.meta.url);
const glob: typeof import('glob') = require('glob');

export type PackageModule = {
  absolute: string;
  name: string;
  package: string;
  relative: string;
};

type PackageModulesEntry = {
  packageName: string;
  modules: PackageModule[];
};

type GroupedMatches = Record<string, PackageModule[]>;

const matches = glob.sync(vxPath.rel(vxPath.packageSrc('*', '**/*.ts')), {
  cwd: vxPath.ROOT_PATH,
  absolute: false,
  ignore: [
    vxPath.rel(vxPath.packageSrc('*', '**/*/index.ts')),
    `**/${dir.TESTS}/**`,
  ],
});

const groupedMatches = matches.reduce<GroupedMatches>((acc, relative) => {
  const name = basename(relative, '.ts');
  const packageName = vxPath.packageNameFromPath(relative);
  const absolute = join(vxPath.ROOT_PATH, relative);

  const moduleData = {
    absolute,
    name,
    package: packageName,
    relative,
  };

  acc[packageName] = (acc[packageName] || []).concat(moduleData);
  return acc;
}, {} as GroupedMatches);

const list: PackageModulesEntry[] = Object.entries(groupedMatches).map(
  ([packageName, modules]) => ({
    packageName,
    modules,
  }),
);

findDuplicates();

export { groupedMatches as packages, list, genPathsPerPackage };

/**
 * Ensures there are no duplicate module names within a package.
 * @throws {Error} When duplicates are detected.
 */
function findDuplicates(): void {
  const duplicatesContainer = list.reduce<
    Record<string, { baseline: Set<string>; duplicates: Set<string> }>
  >((acc, packageEntry) => {
    const baseline = new Set<string>();
    const duplicates = new Set<string>();

    acc[packageEntry.packageName] = {
      baseline,
      duplicates,
    };

    packageEntry.modules.forEach(({ name }) => {
      if (baseline.has(name)) {
        duplicates.add(name);
      }
      baseline.add(name);
    });

    return acc;
  }, {});

  const duplicatesPerPackage: string[] = [];

  for (const [packageName, { duplicates }] of Object.entries(
    duplicatesContainer,
  )) {
    if (isNotEmptySet(duplicates)) {
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
function genPathsPerPackage(
  packageName: string,
  { addPathToArray = false }: { addPathToArray?: boolean },
): Record<string, string | string[]> {
  const packageData = groupedMatches[packageName];

  if (!packageData) {
    return {};
  }

  return packageData.reduce<Record<string, string | string[]>>(
    (paths, currentModule) => {
      const filePath = vxPath.rel(
        currentModule.absolute,
        vxPath.package(packageName),
      );

      return Object.assign(paths, {
        [currentModule.name]: addPathToArray ? [filePath] : filePath,
      });
    },
    {},
  );
}
