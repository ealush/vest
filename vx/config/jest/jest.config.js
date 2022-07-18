const path = require('path');

const glob = require('glob');

const moduleAliases = require('../../util/moduleAliases');

const opts = require('vx/opts');
const packageNames = require('vx/packageNames');
const { usePackage } = require('vx/vxContext');
const vxPath = require('vx/vxPath');

const modulesPerPackage = moduleAliases().reduce(
  (accumulator, currentPackage) =>
    Object.assign(accumulator, {
      [currentPackage.packageName]: currentPackage.modules,
    }),
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

module.exports = {
  projects: packageNames.list.map(package => ({
    displayName: package,
    ...baseConfig(
      {
        moduleNameMapper: modulesPerPackage[package].reduce(
          (modules, currentModule) =>
            Object.assign(modules, {
              [`^${currentModule.name}$`]: currentModule.absolute,
            }),
          {}
        ),
        rootDir: vxPath.package(package),
      },
      package
    ),
  })),
};

function baseConfig(custom = {}, packageName = null) {
  return {
    clearMocks: true,
    globals: {
      'ts-jest': {
        tsconfig:
          packageName ?? usePackage()
            ? vxPath.packageTsConfig(packageName ?? usePackage())
            : path.join(vxPath.ROOT_PATH, opts.fileNames.TSCONFIG_JSON),
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
    // modulePathIgnorePatterns: [...ignoreGeneratedExports],
    preset: 'ts-jest',
    rootDir: vxPath.ROOT_PATH,
    roots: ['<rootDir>'],
    setupFiles: [
      path.resolve(vxPath.JEST_CONFIG_PATH, opts.fileNames.JEST_SETUP),
    ].concat(setupPerPackage),
    setupFilesAfterEnv: [
      path.resolve(
        vxPath.JEST_CONFIG_PATH,
        opts.fileNames.JEST_SETUP_AFTER_ENV
      ),
    ].concat(setupAfterEnvPerPackage),
    testEnvironment: 'node',
    testMatch: [
      vxPath.packageSrc('*', `**/${opts.dir.TESTS}/*.(spec|test).ts`),
    ],
    ...custom,
  };
}
