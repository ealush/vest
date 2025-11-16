module.exports = {
  dir: {
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
  },
  env: {
    PRODUCTION: 'production',
    DEVELOPMENT: 'development',
    TEST: 'test',
  },
  fileNames: {
    CHANGELOG: 'CHANGELOG.md',
    MAIN_EXPORT: 'index.js',
    NPM_IGNORE: '.npmignore',
    PACKAGE_JSON: 'package.json',
    TSCONFIG_JSON: 'tsconfig.json',
    TSDOWN_CONFIG: 'tsdown.config.ts',
    VITEST_CONFIG: 'vitest.config.ts',
    VX_BUILD: 'vx.build.js',
  },
  format: {
    CJS: 'cjs',
    ES: 'es',
    MJS: 'mjs',
    UMD: 'umd',
  },
  release_tags: {
    NIGHTLY: 'nightly',
    NEXT: 'next',
    DEV: 'dev',
  },
  vx_config: {
    VX_ALLOW_RESOLVE: 'vxAllowResolve',
  },
};
