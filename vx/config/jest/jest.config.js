const path = require('path');

const moduleAliases = require('../../util/moduleAliases');

const packageName = require('vx/packageName');
const vxPath = require('vx/vxPath');

const moduleNameMapper = moduleAliases().reduce(
  (aliases, { name, absolute }) =>
    Object.assign(aliases, { [`^${name}$`]: absolute }),
  {}
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
        ], // essentially ignoring "any" errors in tests
      },
    },
  },
  moduleNameMapper,
  preset: 'ts-jest',
  rootDir: '.',
  roots: ['<rootDir>'],
  setupFiles: [path.resolve(vxPath.JEST_CONFIG_PATH, 'jest.setup.ts')],
  setupFilesAfterEnv: [
    path.resolve(vxPath.JEST_CONFIG_PATH, 'jest.setupAfterEnv.ts'),
  ],
  testEnvironment: 'node',
  testMatch: [vxPath.packageSrc('*', '/**/__tests__/*.(spec|test).ts')],
  ...custom,
});
