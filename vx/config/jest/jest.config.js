const path = require('path');

const glob = require('glob');

const moduleAliases = require('../../util/moduleAliases');

const opts = require('vx/opts');
const packageNames = require('vx/packageNames');
const { usePackage } = require('vx/vxContext');
const vxPath = require('vx/vxPath');

// FIXME: ADD BACK IN
// const ignoreGeneratedExports = moduleAliases().reduce((allExports, current) => {
//   const find = path.join(opts.dir.SRC, opts.dir.EXPORTS);
//   if (current.absolute.indexOf(find) === -1) {
//     return allExports;
//   }

//   const x = path
//     .join(...current.absolute.split(find))
//     .replace('.ts', `/${opts.fileNames.PACKAGE_JSON}`);

//   return allExports.concat(x);
// }, []);

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

const projects = packageNames.list.map(packageName => ({
  ...baseConfig(),
  displayName: packageName,
  moduleNameMapper: packagePathsToNameMapper(packageName),
  rootDir: vxPath.package(packageName),
  testMatch: [`**/${opts.dir.TESTS}/*.(spec|test).ts`],
}));

module.exports = {
  projects,
};

function baseConfig() {
  return {
    clearMocks: true,
    globals: {
      'ts-jest': {
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
  };
}

function packagePathsToNameMapper(packageName) {
  const packagePaths = moduleAliases().packages[packageName];

  return packagePaths.reduce(
    (mapper, currentModule) =>
      Object.assign(mapper, moduleToNameMapper(currentModule)),
    {}
  );
}

function moduleToNameMapper(module) {
  return { [`^${module.name}$`]: module.absolute };
}
