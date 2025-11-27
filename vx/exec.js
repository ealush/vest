import { execSync } from 'child_process';

import * as logger from 'vx/logger.js';
import joinTruthy from 'vx/util/joinTruthy.js';
import vxPath from 'vx/vxPath.js';

/**
 * Executes a shell command from the repository root.
 * @param {string | string[]} command Command or arguments to execute.
 * @param {{ exitOnFailure?: boolean, throwOnFailure?: boolean, silent?: boolean, raw?: boolean }} [options] Execution options.
 * @returns {void}
 */

export default function exec(
  command,
  {
    exitOnFailure = true,
    throwOnFailure = false,
    silent = false,
    raw = false,
  } = {},
) {
  const cmd = joinTruthy(command?.flat?.() ?? command, ' ');

  if (!raw && !silent) {
    logger.info(`🎬 Executing command: "${cmd}"`);
  }

  execCommand(cmd, { exitOnFailure, silent, throwOnFailure });
}

/**
 * Executes command and handles failures based on options.
 * @param {string} command Command string to execute.
 * @param {{ silent?: boolean, throwOnFailure?: boolean, exitOnFailure?: boolean }} options Control logging and failure behavior.
 * @returns {void}
 */
function execCommand(command, { silent, throwOnFailure, exitOnFailure }) {
  try {
    run(command, silent);
  } catch (err) {
    if (throwOnFailure) {
      throw err;
    }

    logger.error(err.message);

    if (exitOnFailure) exit();
  }
}

/**
 * Runs a command synchronously.
 * @param {string} command Command to execute.
 * @param {boolean} silent Whether to suppress output.
 * @returns {void}
 */
function run(command, silent) {
  execSync(command, {
    // Run commands from the repo root so workspace binaries are available.
    cwd: vxPath.ROOT_PATH,
    stdio: silent ? 'ignore' : 'inherit',
  });
}

/**
 * Exits the process with error code 1.
 * @returns {never}
 */
function exit() {
  process.exit(1);
}
