import genNpmIgnore from '../npmignore/npmignore.js';
import genTsConfig from '../tsconfig/tsconfig.js';

import * as logger from 'vx/logger.js';
import genVitestConfig from 'vx/scripts/genVitestConfig.js';

/**
 * Generates supporting config files for all packages.
 */
export default function prepare(): void {
  logger.info('Preparing packages...');
  genNpmIgnore();
  genTsConfig();
  genVitestConfig();
}
