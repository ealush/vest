const fs = require('fs');

const lodash = require('lodash');

const exec = require('vx/exec');
const logger = require('vx/logger');
const packageNames = require('vx/packageNames');
const getModuleAliases = require('vx/util/moduleAliases');
const vxPath = require('vx/vxPath');

const prevTsConfig = require(vxPath.TSCONFIG_PATH);

const moduleAliases = getModuleAliases();

const paths = moduleAliases.reduce(
  (paths, package) => {
    Object.assign(paths.entries, {
      [package.packageName]: [package.entry.relative],
    });

    paths.packages[package.packageName] = package.modules.reduce(
      (accumulator, currentModule) => {
        accumulator[currentModule.name] = [currentModule.relative];
        return accumulator;
      },
      {}
    );

    return paths;
  },
  {
    entries: {},
    packages: {},
  }
);

module.exports = function genTsConfig() {
  packageNames.list.forEach(packageName => {
    const tsConfigPath = vxPath.packageTsConfig(packageName);
    const modified = packageTsConfigTemplate(paths.packages[packageName]);

    writeTsConfig(tsConfigPath, modified);
  });

  writeTsConfig(vxPath.TSCONFIG_PATH, rootTsConfigTemplate(paths.entries));
};

function writeTsConfig(filePath, content) {
  let prev = {};

  try {
    prev = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    logger.log(`Could not read tsconfig file: ${filePath}. Possibly new file.`);
  }

  if (!lodash.isEqual(prev, content)) {
    logger.log(`Generating tsconfig file: ${filePath}`);
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
    exec(`yarn prettier ${filePath} -w`);
  }
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
      rootDir: '.',
      skipLibCheck: true,
      sourceMap: true,
      strict: true,
      paths,
    },
    files: [`${vxPath.rel(vxPath.JEST_CONFIG_PATH)}/globals.d.ts`],
    include: [vxPath.rel(vxPath.packageSrc('*', '**/*.ts'))],
  };
}

function packageTsConfigTemplate(paths = []) {
  return {
    extends: '../../tsconfig.json',
    compilerOptions: {
      declarationDir: './types',
      declarationMap: true,
      outDir: './dist',
      paths,
    },
  };
}
