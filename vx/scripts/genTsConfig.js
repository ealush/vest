import { createRequire } from 'module';

import fsExtra from 'fs-extra';
import lodash from 'lodash';

import exec from 'vx/exec.js';
import * as logger from 'vx/logger.js';
import { packageNames } from 'vx/packageNames.js';
import vxPath from 'vx/vxPath.js';

const { writeJSONSync } = fsExtra;
const require = createRequire(import.meta.url);

/**
 * Generates tsconfig files for the workspace and each package.
 * @returns {void}
 */
export default function genTsConfig() {
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
}

/**
 * Compares an existing tsconfig file against the provided config object.
 * @param {string} path Path to tsconfig.json.
 * @param {Record<string, any>} tsConfig Expected configuration object.
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
 * @param {Record<string, any>} tsConfig Configuration to serialize.
 * @returns {void}
 */
function writeTsConfig(path, tsConfig) {
  logger.log(`📝 Writing ts config to ${path}`);

  writeJSONSync(path, tsConfig, { spaces: 2 });
  exec(`yarn prettier ${path} -w`);
}

/**
 * Builds the per-package tsconfig template.
 * @returns {Record<string, any>} tsconfig JSON object.
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
 * @returns {Record<string, any>} tsconfig JSON object.
 */
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
      paths: {
        anyone: ['./packages/anyone/src'],
        context: ['./packages/context/src'],
        n4s: ['./packages/n4s/src'],
        'n4s/*': ['./packages/n4s/src/*'],
        vast: ['./packages/vast/src'],
        vest: ['./packages/vest/src'],
        'vest-utils': ['./packages/vest-utils/src'],
        'vest-utils/*': ['./packages/vest-utils/src/*'],
        'vestjs-runtime': ['./packages/vestjs-runtime/src'],
        'vestjs-runtime/*': ['./packages/vestjs-runtime/src/*'],
      },
      skipLibCheck: true,
      sourceMap: true,
      strict: true,
      target: 'ES2015',
    },
    files: [`${vxPath.rel(vxPath.VITEST_CONFIG_PATH)}/vitest.d.ts`],
    include: [
      vxPath.rel(vxPath.packageSrc('*', '**/*.ts')),
      vxPath.rel(vxPath.packageVitestConfig('*')),
      './packages/*/bench/**/*.ts',
    ],
  };
}
