import { createRequire } from 'module';

import fsExtra from 'fs-extra';
import isEqual from 'lodash/isEqual.js';

import exec from 'vx/exec.js';
import * as logger from 'vx/logger.js';
import { packageNames } from 'vx/packageNames.js';
import vxPath from 'vx/vxPath.js';

type TsConfig = Record<string, unknown>;

const { writeJSONSync } = fsExtra;
const require = createRequire(import.meta.url);

/**
 * Generates tsconfig files for the workspace and each package.
 * @returns {void}
 */
export default function genTsConfig(): void {
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
 */
function isConfigEqual(path: string, tsConfig: TsConfig): boolean {
  let prev: TsConfig | undefined;
  try {
    prev = require(path) as TsConfig;
  } catch (e) {
    prev = {};
  }
  return isEqual(prev, tsConfig);
}

/**
 */
function writeTsConfig(path: string, tsConfig: TsConfig): void {
  logger.log(`📝 Writing ts config to ${path}`);

  writeJSONSync(path, tsConfig, { spaces: 2 });
  exec(`yarn prettier ${path} -w`);
}

/**
 */
function packageTsConfigTemplate(_packageName: string): TsConfig {
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
 */
function rootTsConfigTemplate(): TsConfig {
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
