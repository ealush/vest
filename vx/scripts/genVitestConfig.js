const fs = require('fs');

const exec = require('vx/exec');
const logger = require('vx/logger');
const opts = require('vx/opts');
const packageNames = require('vx/packageNames');
const packageList = require('vx/util/packageList');
const { genPathsPerPackage } = require('vx/util/pathsPerPackage');
const vxPath = require('vx/vxPath');

const VITEST_CONFIG_PATH = 'vx/config/vitest/customMatchers.ts';

module.exports = function genVitestConfig() {
  logger.info('Generating vitest.config.ts files...');

  mainConfig();
  packageNames.list.forEach(packageName => {
    perPackageConfig(packageName);
  });

  logger.info('👌 Done generating vitest.config files.\n');
};

function perPackageConfig(packageName) {
  const configPath = vxPath.packageVitestConfig(packageName);

  let existingContent = '';

  if (fs.existsSync(configPath)) {
    existingContent = fs.readFileSync(configPath, 'utf8');
  }

  /**
   * @type {Record<string, string>} alias // { 'moduleName': './path/to/moduleName' }
   */
  const allPaths = genPathsPerPackage(packageName, { addPathToArray: false });

  const alias = Object.entries(allPaths)
    .map(([name, path]) => {
      // is name one word or multiple words (has -)?
      const nameToUse = name.match(/[-@.]/) ? `'${name}'` : name;
      return `${nameToUse}: resolve(__dirname, '${path.slice(2)}')`;
    })
    .join(',\n      ');

  const next = genConfig(alias);

  if (existingContent === next) {
    logger.log(`✅ ${packageName} vitest.config is up to date. Skipping.`);
    return;
  }

  logger.log(`📝 Writing vitest.config file for ${packageName}`);

  fs.writeFileSync(configPath, next, 'utf8');
}

function mainConfig() {
  const configPath = vxPath.VITEST_CONFIG_FILE_PATH;

  let existingContent = '';

  if (fs.existsSync(vxPath.VITEST_CONFIG_FILE_PATH)) {
    existingContent = fs.readFileSync(vxPath.VITEST_CONFIG_FILE_PATH, 'utf8');
  }

  const mainConfig = mainConfigTemplate();

  if (existingContent === mainConfig) {
    logger.log('✅ Main vitest.config is up to date. Skipping.');
    return;
  }

  logger.log('📝 Writing main vitest.config file');

  fs.writeFileSync(configPath, mainConfig, 'utf8');
  exec(`yarn prettier ${configPath} -w`);
}

function mainConfigTemplate() {
  return `import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['${opts.dir.PACKAGES}/${vxPath.TEST_FILE_PATTERN}'],
    setupFiles: ['${VITEST_CONFIG_PATH}/customMatchers.ts'],
  },
  root: __dirname,
  plugins: [
    tsconfigPaths({
      loose: true,
      projects: ${JSON.stringify(packageList.names.map(p => `${opts.dir.PACKAGES}/${p}`))},
    }),
  ],
});
`;
}

function genConfig(alias = {}) {
  return `import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    include: ['./**/__tests__/*.test.ts'],
    setupFiles: [resolve(__dirname, '../../', '${VITEST_CONFIG_PATH}')],
  },
  root: __dirname,
  resolve: {
    alias: {
      ${alias}
    }
  },
});`;
}
