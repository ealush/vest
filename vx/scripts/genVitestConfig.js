import fs from 'fs';

import exec from 'vx/exec.js';
import * as logger from 'vx/logger.js';
import * as opts from 'vx/opts.js';
import vxPath from 'vx/vxPath.js';

const VITEST_CONFIG_PATH = 'vx/config/vitest';

/**
 * Generates vitest configuration files for the workspace and each package.
 * @returns {void}
 */

export default function genVitestConfig() {
  logger.info('Generating vitest.config.ts files...');
  mainConfig();
  logger.info('👌 Done generating vitest.config files.\n');
}

/**
 * Writes the top-level vitest configuration when content changed.
 * @returns {void}
 */
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

/**
 * Template for the root vitest config file.
 * @returns {string} Serialized config source.
 */
function mainConfigTemplate() {
  return `;
import { fileURLToPath } from 'url';
import path from 'path';
import { defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  test: {
    globals: true,
    include: ['${opts.dir.PACKAGES}/${vxPath.TEST_FILE_PATTERN}'],
    setupFiles: ['${VITEST_CONFIG_PATH}/customMatchers.ts'],
  },
  root: __dirname,
  plugins: [],
});
`;
}
