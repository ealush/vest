const path = require('path');

const glob = require('glob');

const opts = require('vx/opts');
const packageNames = require('vx/packageNames');
const packageJson = require('vx/util/packageJson');
const pathsPerPackage = require('vx/util/pathsPerPackage');
const { usePackage } = require('vx/vxContext');
const vxPath = require('vx/vxPath');

const setupPerPackage = glob.sync(
  vxPath.packageConfigPath(
    usePackage() ?? '*',
    opts.dir.JEST,
    opts.fileNames.JEST_SETUP,
  ),
);

const setupAfterEnvPerPackage = glob.sync(
  vxPath.packageConfigPath(
    usePackage() ?? '*',
    opts.dir.JEST,
    opts.fileNames.JEST_SETUP_AFTER_ENV,
  ),
);

const projects = packageNames.list.map(packageName => ({
  ...baseConfig(packageName),
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

function baseConfig(packageName) {
  const allowResolve = packageJson.getVxAllowResolve(packageName);
  return {
    clearMocks: true,
    maxWorkers: 1,
    rootDir: vxPath.ROOT_PATH,
    roots: ['<rootDir>'],
    setupFiles: [
      path.resolve(vxPath.JEST_CONFIG_PATH, opts.fileNames.JEST_SETUP),
    ].concat(setupPerPackage),
    setupFilesAfterEnv: [
      path.resolve(
        vxPath.JEST_CONFIG_PATH,
        opts.fileNames.JEST_SETUP_AFTER_ENV,
      ),
    ].concat(setupAfterEnvPerPackage),
    testEnvironment: 'node',
    transform: {
      [`.+\\.(ts|tsx)$`]: [
        'ts-jest',
        {
          isolatedModules: true,
          tsconfig: {
            // This is needed to allow jest to transform js files
            // That are originated in node_modules
            allowJs: true,
          },
        },
      ],
    },
    ...(allowResolve.length > 0 && {
      preset: 'ts-jest/presets/js-with-ts',
      transformIgnorePatterns: [
        `node_modules/(?!(${allowResolve.join('|')})/.*)`,
      ],
    }),
  };
}

function genNameMapper(modules) {
  return modules.reduce(
    (aliases, { name, absolute }) =>
      Object.assign(aliases, {
        [`^${name}$`]: absolute,
      }),
    {},
  );
}
