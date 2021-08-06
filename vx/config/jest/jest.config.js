const path = require('path');

const glob = require('glob');

const moduleAliases = require('../../util/moduleAliases');

const opts = require('vx/opts');
const packageName = require('vx/packageName');
const vxPath = require('vx/vxPath');

const moduleNameMapper = moduleAliases().reduce(
  (aliases, { name, absolute }) =>
    Object.assign(aliases, { [`^${name}$`]: absolute }),
  {}
);

const setupPerPackage = glob.sync(
  vxPath.packageConfigPath(
    packageName() ?? '*',
    'jest',
    opts.fileNames.JEST_SETUP
  )
);

const setupAfterEnvPerPackage = glob.sync(
  vxPath.packageConfigPath(
    packageName() ?? '*',
    'jest',
    opts.fileNames.JEST_SETUP_AFTER_ENV
  )
);

module.exports = (custom = {}) => ({
  clearMocks: true,
  globals: {
    'ts-jest': {
      tsconfig: packageName()
        ? vxPath.packageTsConfig()
        : path.join(vxPath.ROOT_PATH, 'tsconfig.json'),
      diagnostics: {
        ignoreCodes: [
          'TS7005',
          'TS7006',
          'TS7016',
          'TS7034',
          'TS7053',
          'TS7031',
          'TS2339', // FIXME! Remove this one! Hides the "missing property" error
        ], // essentially ignoring "any" errors in tests
      },
    },
  },
  moduleNameMapper,
  preset: 'ts-jest',
  rootDir: '.',
  roots: ['<rootDir>'],
  setupFiles: [path.resolve(vxPath.JEST_CONFIG_PATH, 'jest.setup.ts')].concat(
    setupPerPackage
  ),
  setupFilesAfterEnv: [
    path.resolve(vxPath.JEST_CONFIG_PATH, 'jest.setupAfterEnv.ts'),
  ].concat(setupAfterEnvPerPackage),
  testEnvironment: 'node',
  testMatch: [vxPath.packageSrc('*', `/**/${opts.dir.TESTS}/*.(spec|test).ts`)],
  ...custom,
});
