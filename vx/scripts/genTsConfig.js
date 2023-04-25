const path = require('path');

const { writeJSONSync } = require('fs-extra');
const lodash = require('lodash');
const exec = require('vx/exec');
const logger = require('vx/logger');
const packageNames = require('vx/packageNames');
const pathsPerPackage = require('vx/util/pathsPerPackage');
const vxPath = require('vx/vxPath');

module.exports = function genTsConfig() {
  const mainTsConfig = rootTsConfigTemplate();

  if (!isConfigEqual(vxPath.TSCONFIG_PATH, mainTsConfig)) {
    logger.log('Writing main tsconfig.json');
    writeTsConfig(vxPath.TSCONFIG_PATH, mainTsConfig);
  } else {
    logger.log('✅ Main tsconfig.json is up to date. Skipping.');
  }

  packageNames.list.forEach(packageName => {
    const paths = genPathsPerPackage(packageName);
    const tsConfig = packageTsConfigTemplate(paths, packageName);

    const tsConfigPath = vxPath.packageTsConfig(packageName);

    if (isConfigEqual(tsConfigPath, tsConfig)) {
      logger.log(
        `✅ tsConfig for package '${packageName}' is up to date. Skipping.`
      );
      return;
    }

    writeTsConfig(tsConfigPath, tsConfig);
  });

  logger.info('👌 Done generating tsconfig files.\n');
};

function isConfigEqual(path, tsConfig) {
  let prev;

  try {
    prev = require(path);
  } catch (e) {
    prev = {};
  }

  return lodash.isEqual(prev, tsConfig);
}

function writeTsConfig(path, tsConfig) {
  logger.log(`📝 Writing ts config to ${path}`);

  writeJSONSync(path, tsConfig, { spaces: 2 });
  exec(`yarn prettier ${path} -w`);
}

function packageTsConfigTemplate(paths = []) {
  return {
    extends: '../../tsconfig.json',
    rootDir: '.',
    compilerOptions: {
      baseUrl: '.',
      declarationDir: './types',
      declarationMap: true,
      outDir: './dist',
      paths,
    },
  };
}

function rootTsConfigTemplate() {
  return {
    compilerOptions: {
      allowJs: false,
      baseUrl: '.',
      declaration: true,
      esModuleInterop: true,
      forceConsistentCasingInFileNames: true,
      importHelpers: true,
      lib: ['esnext'],
      module: 'esnext',
      moduleResolution: 'node',
      noEmit: true,
      noFallthroughCasesInSwitch: true,
      noImplicitAny: true,
      noImplicitReturns: false,
      noImplicitThis: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      skipLibCheck: true,
      sourceMap: true,
      strict: true,
      target: 'ES2015',
    },
    files: [`${vxPath.rel(vxPath.JEST_CONFIG_PATH)}/globals.d.ts`],
    include: [vxPath.rel(vxPath.packageSrc('*', '**/*.ts'))],
  };
}

function genPathsPerPackage(packageName) {
  const packageData = pathsPerPackage.packages[packageName];

  return packageData.reduce(
    (paths, currentModule) =>
      Object.assign(paths, {
        [currentModule.name]: [
          path.relative(
            vxPath.package(currentModule.package),
            currentModule.relative
          ),
        ],
      }),
    {}
  );
}
