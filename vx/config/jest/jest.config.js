const path = require('path');

const glob = require('glob');

const moduleAliases = require('../../util/moduleAliases');

const opts = require('vx/opts');
const { usePackage } = require('vx/vxContext');
const vxPath = require('vx/vxPath');

const ignoreGeneratedExports = moduleAliases().reduce((allExports, current) => {
  const find = path.join(opts.dir.SRC, opts.dir.EXPORTS);
  if (current.absolute.indexOf(find) === -1) {
    return allExports;
  }

  const x = path
    .join(...current.absolute.split(find))
    .replace('.ts', '/package.json');

  return allExports.concat(x);
}, []);

const moduleNameMapper = moduleAliases().reduce(
  (aliases, { name, absolute }) =>
    Object.assign(aliases, { [`^${name}$`]: absolute }),
  {}
);

const setupPerPackage = glob.sync(
  vxPath.packageConfigPath(
    usePackage() ?? '*',
    'jest',
    opts.fileNames.JEST_SETUP
  )
);

const setupAfterEnvPerPackage = glob.sync(
  vxPath.packageConfigPath(
    usePackage() ?? '*',
    'jest',
    opts.fileNames.JEST_SETUP_AFTER_ENV
  )
);

module.exports = (custom = {}) => ({
  clearMocks: true,
  globals: {
    'ts-jest': {
      tsconfig: usePackage()
        ? vxPath.packageTsConfig()
        : path.join(vxPath.ROOT_PATH, vxPath.TSCONFIG_JSON),
      diagnostics: {
        // Essentially ignoring "any" errors in TESTS
        ignoreCodes: [
          'TS7005',
          'TS7006',
          'TS7016',
          'TS7034',
          'TS7053',
          'TS7031',
          'TS2339',
        ],
      },
    },
  },
  moduleNameMapper,
  modulePathIgnorePatterns: [...ignoreGeneratedExports],
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
  testMatch: [vxPath.packageSrc('*', `**/${opts.dir.TESTS}/*.(spec|test).ts`)],
  ...custom,
});
