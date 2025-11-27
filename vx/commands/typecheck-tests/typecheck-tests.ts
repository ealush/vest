import exec from 'vx/exec.js';
import * as logger from 'vx/logger.js';

/**
 * Runs TypeScript type checking on the entire project, including tests.
 */
export default function typecheckTests(): void {
  exec('tsc --noEmit');
  logger.info('✅ Typecheck passed (including tests).');
}
