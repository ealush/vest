const path = require('path');

const glob = require('glob');

const opts = require('vx/opts');
const packageNames = require('vx/packageNames');
const pathsPerPackage = require('vx/util/pathsPerPackage');
const { usePackage } = require('vx/vxContext');
const vxPath = require('vx/vxPath');

const setupPerPackage = glob.sync(
  vxPath.packageConfigPath(
    usePackage() ?? '*',
    opts.dir.JEST,
    opts.fileNames.JEST_SETUP
  )
);

const setupAfterEnvPerPackage = glob.sync(
  vxPath.packageConfigPath(
    usePackage() ?? '*',
    opts.dir.JEST,
    opts.fileNames.JEST_SETUP_AFTER_ENV
  )
);

const projects = packageNames.list.map(packageName => ({
  ...baseConfig(),
  displayName: packageName,
  moduleNameMapper: genNameMapper(pathsPerPackage.packages[packageName]),
  rootDir: vxPath.package(packageName),
  testMatch: [
    vxPath.package(packageName, `**/${opts.dir.TESTS}/*.(spec|test).ts`),
  ],
}));

module.exports = {
  projects,
};

function baseConfig() {
  return {
    clearMocks: true,
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
    transform: {
      [`.+\\.(ts|tsx)$`]: [
        'ts-jest',
        {
          diagnostics: {
            // Property '__DEV__' does not exist on type 'typeof globalThis'
            ignoreCodes: ['TS2339'],
          },
        },
      ],
    },
  };
}

function genNameMapper(modules) {
  return modules.reduce(
    (aliases, { name, absolute }) =>
      Object.assign(aliases, {
        [`^${name}$`]: absolute,
      }),
    {}
  );
}
