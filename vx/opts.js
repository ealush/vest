module.exports = {
  dir: {
    CONFIG: 'config',
    DIST: 'dist',
    EXPORTS: 'exports',
    PACKAGES: 'packages',
    SRC: 'src',
    TYPES: 'types',
  },
  env: {
    PRODUCTION: 'production',
    DEVELOPMENT: 'development',
    TEST: 'test',
  },
  fileNames: {
    MAIN_EXPORT: 'index.js',
    JEST_SETUP: 'jest.setup.ts',
    JEST_SETUP_AFTER_ENV: 'jest.setupAfterEnv.ts',
  },
  format: {
    UMD: 'umd',
    CJS: 'cjs',
    ES: 'es',
  },
};
