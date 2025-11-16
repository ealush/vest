const execSync = require('child_process').execSync;

const vxPath = require('./vxPath');

const logger = require('vx/logger');
const joinTruthy = require('vx/util/joinTruthy');

/**
 * Executes a shell command from the repository root.
 * @param {string | string[]} command Command or arguments to execute.
 * @param {{ exitOnFailure?: boolean, throwOnFailure?: boolean, silent?: boolean, raw?: boolean }} [options] Execution options.
 * @returns {void}
 */
function exec(
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

module.exports = exec;

/**
 * Executes command and handles failures based on options.
 * @param {string} command Command string to execute.
 * @param {{ silent?: boolean, throwOnFailure?: boolean, exitOnFailure?: boolean }} options Control logging and failure behavior.
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

function run(command, silent) {
  execSync(command, {
    // Run commands from the repo root so workspace binaries are available.
    cwd: vxPath.ROOT_PATH,
    stdio: silent ? 'ignore' : 'inherit',
  });
}

function exit() {
  process.exit(1);
}
