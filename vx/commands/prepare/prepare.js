import genVitestConfig from '../../scripts/genVitestConfig.js';
import genNpmIgnore from '../npmignore/npmignore.js';
import genTsConfig from '../tsconfig/tsconfig.js';

import * as logger from 'vx/logger.js';

/**
 * Generates supporting config files for all packages.
 */
export default function prepare() {
  logger.info('Preparing packages...');
  genNpmIgnore();
  genTsConfig();
  genVitestConfig();
}
