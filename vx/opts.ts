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
} as const;

export type Dir = (typeof dir)[keyof typeof dir];

export const env = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
  TEST: 'test',
} as const;

export type Env = (typeof env)[keyof typeof env];

export const fileNames = {
  CHANGELOG: 'CHANGELOG.md',
  MAIN_EXPORT: 'index.js',
  NPM_IGNORE: '.npmignore',
  PACKAGE_JSON: 'package.json',
  TSCONFIG_JSON: 'tsconfig.json',
  TSDOWN_CONFIG: 'tsdown.config.ts',
  VITEST_CONFIG: 'vitest.config.ts',
  VX_BUILD: 'vx.build.js',
} as const;

export type FileName = (typeof fileNames)[keyof typeof fileNames];

export const format = {
  CJS: 'cjs',
  ES: 'es',
  MJS: 'mjs',
  UMD: 'umd',
} as const;

export type Format = (typeof format)[keyof typeof format];

export const release_tags = {
  NIGHTLY: 'nightly',
  NEXT: 'next',
  DEV: 'dev',
} as const;

export type ReleaseTag = (typeof release_tags)[keyof typeof release_tags];

export const vx_config = {
  VX_ALLOW_RESOLVE: 'vxAllowResolve',
} as const;

export type VxConfigKey = (typeof vx_config)[keyof typeof vx_config];

export default {
  dir,
  env,
  fileNames,
  format,
  release_tags,
  vx_config,
};
