/**
 * Directory names used throughout the project.
 * @enum {string}
 */
export const dir = {
  COMMANDS: 'commands',
  CONFIG: 'config',
  DIST: 'dist',
  EXPORTS: 'exports',
  PACKAGES: 'packages',
  SCRIPTS: 'scripts',
  SRC: 'src',
  TESTS: '__tests__',
  TYPES: 'types',
  VITEST: 'vitest',
  VX: 'vx',
};

/**
 * Environment names.
 * @enum {string}
 */
export const env = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
  TEST: 'test',
};

/**
 * Common file names.
 * @enum {string}
 */
export const fileNames = {
  CHANGELOG: 'CHANGELOG.md',
  MAIN_EXPORT: 'index.js',
  NPM_IGNORE: '.npmignore',
  PACKAGE_JSON: 'package.json',
  TSCONFIG_JSON: 'tsconfig.json',
  TSDOWN_CONFIG: 'tsdown.config.ts',
  VITEST_CONFIG: 'vitest.config.ts',
  VX_BUILD: 'vx.build.js',
};

/**
 * Output formats.
 * @enum {string}
 */
export const format = {
  CJS: 'cjs',
  ES: 'es',
  MJS: 'mjs',
  UMD: 'umd',
};

/**
 * Release tags.
 * @enum {string}
 */
export const release_tags = {
  NIGHTLY: 'nightly',
  NEXT: 'next',
  DEV: 'dev',
};

/**
 * VX configuration keys.
 * @enum {string}
 */
export const vx_config = {
  VX_ALLOW_RESOLVE: 'vxAllowResolve',
};

export default {
  dir,
  env,
  fileNames,
  format,
  release_tags,
  vx_config,
};
