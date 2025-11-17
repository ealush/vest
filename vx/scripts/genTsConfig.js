const { writeJSONSync } = require('fs-extra');
const lodash = require('lodash');

const exec = require('vx/exec');
const logger = require('vx/logger');
const packageNames = require('vx/packageNames');
const vxPath = require('vx/vxPath');

/**
 * Generates tsconfig files for the workspace and each package.
 * @returns {void}
 */
module.exports = function genTsConfig() {
  const mainTsConfig = rootTsConfigTemplate();

  if (!isConfigEqual(vxPath.TSCONFIG_PATH, mainTsConfig)) {
    logger.log('Writing main tsconfig.json');
    writeTsConfig(vxPath.TSCONFIG_PATH, mainTsConfig);
  } else {
    logger.log('✅ Main tsconfig.json is up to date. Skipping.');
  }

  packageNames.list.forEach(packageName => {
    const tsConfig = packageTsConfigTemplate(packageName);

    const tsConfigPath = vxPath.packageTsConfig(packageName);

    if (isConfigEqual(tsConfigPath, tsConfig)) {
      logger.log(
        `✅ tsConfig for package '${packageName}' is up to date. Skipping.`,
      );
      return;
    }

    writeTsConfig(tsConfigPath, tsConfig);
  });

  logger.info('👌 Done generating tsconfig files.\n');
};

/**
 * Compares an existing tsconfig file against the provided config object.
 * @param {string} path Path to tsconfig.json.
 * @param {object} tsConfig Expected configuration object.
 * @returns {boolean} True when the file content matches the object.
 */
function isConfigEqual(path, tsConfig) {
  let prev;

  try {
    prev = require(path);
  } catch (e) {
    prev = {};
  }

  return lodash.isEqual(prev, tsConfig);
}

/**
 * Writes a tsconfig file and formats it.
 * @param {string} path Destination path.
 * @param {object} tsConfig Configuration to serialize.
 */
function writeTsConfig(path, tsConfig) {
  logger.log(`📝 Writing ts config to ${path}`);

  writeJSONSync(path, tsConfig, { spaces: 2 });
  exec(`yarn prettier ${path} -w`);
}

/**
 * Builds the per-package tsconfig template.
 * @returns {object} tsconfig JSON object.
 */
function packageTsConfigTemplate() {
  return {
    extends: '../../tsconfig.json',
    rootDir: '.',
    compilerOptions: {
      declarationDir: './types',
      declarationMap: true,
      outDir: './dist',
    },
  };
}

/**
 * Builds the root tsconfig template.
 * @returns {object} tsconfig JSON object.
 */
function rootTsConfigTemplate() {
  return {
    compilerOptions: {
      allowJs: false,
      declaration: true,
      esModuleInterop: true,
      forceConsistentCasingInFileNames: true,
      importHelpers: true,
      lib: ['esnext'],
      module: 'esnext',
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
    files: [`${vxPath.rel(vxPath.VITEST_CONFIG_PATH)}/vitest.d.ts`],
    include: [vxPath.rel(vxPath.packageSrc('*', '**/*.ts'))],
  };
}
