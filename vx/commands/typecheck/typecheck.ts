import exec from 'vx/exec.js';
import * as logger from 'vx/logger.js';

/**
 * Runs TypeScript type checking on application code.
 */
export default function typecheck(): void {
  exec('tsc --noEmit -p tsconfig.typecheck.json');
  logger.log('✅ Typecheck passed (application code only).');
}
