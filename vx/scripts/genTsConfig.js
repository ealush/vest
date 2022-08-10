const fs = require('fs');
const path = require('path');

const { writeJSONSync } = require('fs-extra');
const lodash = require('lodash');

const exec = require('vx/exec');
const logger = require('vx/logger');
const packageNames = require('vx/packageNames');
const getModuleAliases = require('vx/util/moduleAliases');
const vxPath = require('vx/vxPath');

const moduleAliases = getModuleAliases();

const paths = moduleAliases.reduce(
  (paths, currentModule) =>
    Object.assign(paths, { [currentModule.name]: [currentModule.relative] }),
  {}
);

const pathPerPackage = moduleAliases.reduce((paths, currentModule) => {
  paths[currentModule.package] = paths[currentModule.package] || {};
  const rel = path.relative(
    vxPath.package(currentModule.package),
    currentModule.relative
  );
  paths[currentModule.package][currentModule.name] = [rel];
  return paths;
}, {});

module.exports = function genTsConfig() {
  const mainTsConfig = rootTsConfigTemplate(paths);

  if (!isConfigEqual(vxPath.TSCONFIG_PATH, mainTsConfig)) {
    logger.log('Writing main tsconfig.json');
    writeTsConfig(vxPath.TSCONFIG_PATH, mainTsConfig);
  } else {
    logger.log('✅ Main tsconfig.json is up to date. Skipping.');
  }

  packageNames.list.forEach(packageName => {
    const paths = pathPerPackage[packageName];
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
  logger.log(`Writing ts config to ${path}`);

  writeJSONSync(path, tsConfig, { spaces: 2 });

  fs.writeFileSync(path, JSON.stringify(tsConfig, null, 2));

  exec(`yarn prettier ${path} -w`);
}

function packageTsConfigTemplate(paths = []) {
  return {
    extends: '../../tsconfig.json',
    rootDir: '.',
    compilerOptions: {
      baseUrl: '.',
      declarationMap: true,
      declarationDir: './types',
      outDir: './dist',
      paths,
    },
  };
}

function rootTsConfigTemplate(paths = []) {
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
      paths,
      rootDir: '.',
      skipLibCheck: true,
      sourceMap: true,
      strict: true,
    },
    files: [`${vxPath.rel(vxPath.JEST_CONFIG_PATH)}/globals.d.ts`],
    include: ['./packages/*/src/**/*.ts'],
  };
}
