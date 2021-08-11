module.exports = {
  dir: {
    CONFIG: 'config',
    DIST: 'dist',
    EXPORTS: 'exports',
    PACKAGES: 'packages',
    SRC: 'src',
    TESTS: '__tests__',
    TYPES: 'types',
  },
  env: {
    PRODUCTION: 'production',
    DEVELOPMENT: 'development',
    TEST: 'test',
  },
  fileNames: {
    JEST_CONFIG: 'jest.config.js',
    JEST_SETUP: 'jest.setup.ts',
    JEST_SETUP_AFTER_ENV: 'jest.setupAfterEnv.ts',
    MAIN_EXPORT: 'index.js',
  },
  format: {
    UMD: 'umd',
    CJS: 'cjs',
    ES: 'es',
  },
};
