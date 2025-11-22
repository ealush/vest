import fs from 'fs';
import path from 'path';

import * as opts from './opts.js';
import { usePackage } from './vxContext.js';

const vxPath = {};

/**
 * Finds the closest directory upwards from CWD that contains a vx-enabled package.json.
 * @returns {string | undefined} Absolute path to the repository root.
 */
vxPath.vxRoot = () => {
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
vxPath.packageNameFromPath = pathSegment => {
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
vxPath.package = (pkgName = usePackage(), ...args) => {
  return path.resolve(vxPath.PACKAGES_PATH, pkgName, ...args.filter(Boolean));
};

/**
 * Resolves the dist directory for a package.
 * @param {string} [pkgName] Package name; defaults to active context.
 * @param {...string} args Additional path segments.
 * @returns {string}
 */
vxPath.packageDist = (pkgName = usePackage(), ...args) => {
  return vxPath.package(pkgName, opts.dir.DIST, ...args);
};

/**
 * Resolves the config directory for a package.
 * @param {string} [pkgName] Package name; defaults to active context.
 * @param {...string} args Additional path segments.
 * @returns {string}
 */
vxPath.packageConfigPath = (pkgName = usePackage(), ...args) => {
  return vxPath.package(pkgName, opts.dir.CONFIG, ...args);
};

/**
 * Resolves the src directory for a package.
 * @param {string} [pkgName] Package name; defaults to active context.
 * @param {...string} args Additional path segments.
 * @returns {string}
 */
vxPath.packageSrc = (pkgName = usePackage(), ...args) => {
  return vxPath.package(pkgName, opts.dir.SRC, ...args);
};

/**
 * Resolves the exports directory under src for a package.
 * @param {string} [pkgName] Package name; defaults to active context.
 * @param {...string} args Additional path segments.
 * @returns {string}
 */
vxPath.packageSrcExports = (pkgName = usePackage(), ...args) => {
  return vxPath.package(pkgName, opts.dir.SRC, opts.dir.EXPORTS, ...args);
};

/**
 * Absolute path to a package tsconfig.json file.
 * @param {string} [pkgName] Package name; defaults to active context.
 * @returns {string}
 */
vxPath.packageTsConfig = (pkgName = usePackage()) => {
  return vxPath.package(pkgName, opts.fileNames.TSCONFIG_JSON);
};

/**
 * Absolute path to a package package.json file.
 * @param {string} [pkgName] Package name; defaults to active context.
 * @returns {string}
 */
vxPath.packageJson = (pkgName = usePackage()) => {
  return vxPath.package(pkgName, opts.fileNames.PACKAGE_JSON);
};

/**
 * Absolute path to a package vitest.config.ts file.
 * @param {string} [pkgName] Package name; defaults to active context.
 * @returns {string}
 */
vxPath.packageVitestConfig = (pkgName = usePackage()) => {
  return vxPath.package(pkgName, opts.fileNames.VITEST_CONFIG);
};

/**
 * Absolute path to a package .npmignore file.
 * @param {string} [pkgName] Package name; defaults to active context.
 * @returns {string}
 */
vxPath.packageNpmIgnore = (pkgName = usePackage()) => {
  return vxPath.package(pkgName, opts.fileNames.NPM_IGNORE);
};

/**
 * Walks upward from a starting path until predicate breaks out.
 * @param {string} start Initial directory.
 * @param {(current: string, breakout: (value?: string) => void, index: number, previous: string | undefined) => void} predicate Function invoked for each path segment.
 * @returns {string | undefined} First path provided to `breakout`.
 */
vxPath.closest = (start, predicate) => {
  let current = start;
  let broke = false;
  let index = 0;
  let prev;
  let match;

  while (current !== prev && !broke) {
    predicate(current, breakout, index, prev);
    prev = current;
    current = path.resolve(current, '..');
    index++;
  }

  return match;

  function breakout(breakValue) {
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
 * @returns {string} Relative path string prefixed with './'.
 */
vxPath.rel = (to, from = vxPath.ROOT_PATH) => {
  return ['.', path.relative(from, to)].join(path.sep);
};

vxPath.ROOT_PATH = vxPath.vxRoot();

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

export default vxPath;
