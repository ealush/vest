import fs from 'fs';
import path from 'path';

import * as opts from 'vx/opts.js';
import { usePackage } from 'vx/vxContext.js';

type ClosestPredicate = (
  current: string,
  breakout: (value?: string) => void,
  index: number,
  previous: string | undefined,
) => void;

type PackagePathFn = (pkgName?: string, ...args: string[]) => string;

type VXPath = {
  vxRoot: () => string | undefined;
  packageNameFromPath: (pathSegment: string) => string;
  package: PackagePathFn;
  packageDist: PackagePathFn;
  packageConfigPath: PackagePathFn;
  packageSrc: PackagePathFn;
  packageSrcExports: PackagePathFn;
  packageTsConfig: (pkgName?: string) => string;
  packageJson: (pkgName?: string) => string;
  packageVitestConfig: (pkgName?: string) => string;
  packageNpmIgnore: (pkgName?: string) => string;
  closest: (start: string, predicate: ClosestPredicate) => string | undefined;
  rel: (to: string, from?: string) => string;
  ROOT_PATH: string;
  VX_ROOT_PATH: string;
  VX_CONFIG_PATH: string;
  VX_SCRIPTS_PATH: string;
  VX_COMMANDS_PATH: string;
  VITEST_CONFIG_PATH: string;
  tsdownConfigPath: string;
  VITEST_CONFIG_FILE_PATH: string;
  TSCONFIG_PATH: string;
  TEST_FILE_PATTERN: string;
  PACKAGES_PATH: string;
  TS_LOADER_PATH: string;
};

const vxPath = {} as VXPath;

/**
 * Finds the closest directory upwards from CWD that contains a vx-enabled package.json.
 * @returns {string | undefined} Absolute path to the repository root.
 */
vxPath.vxRoot = (): string | undefined => {
  return vxPath.closest(process.cwd(), (current, breakout) => {
    const pkgJsonPath = path.resolve(current, opts.fileNames.PACKAGE_JSON);

    if (!fs.existsSync(pkgJsonPath)) {
      return;
    }

    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));

    if (pkgJson[opts.dir.VX]) {
      breakout(current);
    }
  });
};

/**
 * Extracts the package name from a path under the packages directory.
 * @param {string} pathSegment Path that includes the packages directory.
 * @returns {string} Package name.
 */
vxPath.packageNameFromPath = (pathSegment: string): string => {
  // ./packages/vest/src/core/isolate/isolates/skipWhen.ts

  const packagesPosition = pathSegment.indexOf(opts.dir.PACKAGES); // 2
  const withoutDir = pathSegment.substring(
    packagesPosition + opts.dir.PACKAGES.length,
  ); // /vest/src/core/isolate/isolates/skipWhen.ts
  return withoutDir.split(path.sep)[1]; //vest
};

/**
 * Resolves a path within a package.
 * @param {string} [pkgName] Package name; defaults to active context.
 * @param {...string} args Additional path segments.
 * @returns {string} Resolved absolute path.
 */
vxPath.package = (pkgName, ...args) => {
  const packageName = resolvePackageName(pkgName);
  return path.resolve(
    vxPath.PACKAGES_PATH,
    packageName,
    ...args.filter(Boolean),
  );
};

/**
 * Resolves the dist directory for a package.
 * @param {string} [pkgName] Package name; defaults to active context.
 * @param {...string} args Additional path segments.
 * @returns {string}
 */
vxPath.packageDist = (pkgName, ...args) => {
  return vxPath.package(pkgName, opts.dir.DIST, ...args);
};

/**
 * Resolves the config directory for a package.
 * @param {string} [pkgName] Package name; defaults to active context.
 * @param {...string} args Additional path segments.
 * @returns {string}
 */
vxPath.packageConfigPath = (pkgName, ...args) => {
  return vxPath.package(pkgName, opts.dir.CONFIG, ...args);
};

/**
 * Resolves the src directory for a package.
 * @param {string} [pkgName] Package name; defaults to active context.
 * @param {...string} args Additional path segments.
 * @returns {string}
 */
vxPath.packageSrc = (pkgName, ...args) => {
  return vxPath.package(pkgName, opts.dir.SRC, ...args);
};

/**
 * Resolves the exports directory under src for a package.
 * @param {string} [pkgName] Package name; defaults to active context.
 * @param {...string} args Additional path segments.
 * @returns {string}
 */
vxPath.packageSrcExports = (pkgName, ...args) => {
  return vxPath.package(pkgName, opts.dir.SRC, opts.dir.EXPORTS, ...args);
};

/**
 * Absolute path to a package tsconfig.json file.
 * @param {string} [pkgName] Package name; defaults to active context.
 * @returns {string}
 */
vxPath.packageTsConfig = pkgName => {
  return vxPath.package(pkgName, opts.fileNames.TSCONFIG_JSON);
};

/**
 * Absolute path to a package package.json file.
 * @param {string} [pkgName] Package name; defaults to active context.
 * @returns {string}
 */
vxPath.packageJson = pkgName => {
  return vxPath.package(pkgName, opts.fileNames.PACKAGE_JSON);
};

/**
 * Absolute path to a package vitest.config.ts file.
 * @param {string} [pkgName] Package name; defaults to active context.
 * @returns {string}
 */
vxPath.packageVitestConfig = pkgName => {
  return vxPath.package(pkgName, opts.fileNames.VITEST_CONFIG);
};

/**
 * Absolute path to a package .npmignore file.
 * @param {string} [pkgName] Package name; defaults to active context.
 * @returns {string}
 */
vxPath.packageNpmIgnore = pkgName => {
  return vxPath.package(pkgName, opts.fileNames.NPM_IGNORE);
};

/**
 * Walks upward from a starting path until predicate breaks out.
 * @param {string} start Initial directory.
 * @param {(current: string, breakout: (value?: string) => void, index: number, previous: string | undefined) => void} predicate Function invoked for each path segment.
 * @returns {string | undefined} First path provided to `breakout`.
 */
vxPath.closest = (start: string, predicate: ClosestPredicate) => {
  let current = start;
  let broke = false;
  let index = 0;
  let prev: string | undefined;
  let match: string | undefined;

  while (current !== prev && !broke) {
    predicate(current, breakout, index, prev);
    prev = current;
    current = path.resolve(current, '..');
    index++;
  }

  return match;

  function breakout(breakValue?: string) {
    if (breakValue) {
      match = breakValue;
    }

    broke = true;
  }
};

/**
 * Returns a relative path from the repository root.
 * @param {string} to Absolute path target.
 * @param {string} [from=vxPath.ROOT_PATH] Base path.
 */
vxPath.rel = (to, from = vxPath.ROOT_PATH) => {
  return ['.', path.relative(from, to)].join(path.sep);
};

function resolvePackageName(pkgName?: string): string {
  const name = pkgName ?? usePackage();
  if (!name) {
    throw new Error('Package name not found in context.');
  }
  return name;
}

vxPath.ROOT_PATH = vxPath.vxRoot() ?? process.cwd();

vxPath.VX_ROOT_PATH = path.resolve(vxPath.ROOT_PATH, opts.dir.VX);

vxPath.VX_CONFIG_PATH = path.resolve(vxPath.VX_ROOT_PATH, opts.dir.CONFIG);

vxPath.VX_SCRIPTS_PATH = path.resolve(vxPath.VX_ROOT_PATH, opts.dir.SCRIPTS);

vxPath.VX_COMMANDS_PATH = path.resolve(vxPath.VX_ROOT_PATH, opts.dir.COMMANDS);

vxPath.VITEST_CONFIG_PATH = path.resolve(
  vxPath.VX_CONFIG_PATH,
  opts.dir.VITEST,
);

vxPath.tsdownConfigPath = path.resolve(
  vxPath.VX_CONFIG_PATH,
  'tsdown',
  opts.fileNames.TSDOWN_CONFIG,
);

vxPath.VITEST_CONFIG_FILE_PATH = path.resolve(
  vxPath.ROOT_PATH,
  opts.fileNames.VITEST_CONFIG,
);

vxPath.TSCONFIG_PATH = path.resolve(
  vxPath.ROOT_PATH,
  opts.fileNames.TSCONFIG_JSON,
);

vxPath.TEST_FILE_PATTERN = `**/${opts.dir.TESTS}/*.test.ts`;

vxPath.PACKAGES_PATH = path.resolve(vxPath.ROOT_PATH, opts.dir.PACKAGES);

vxPath.TS_LOADER_PATH = path.resolve(vxPath.VX_ROOT_PATH, 'ts-loader.js');

export default vxPath;
