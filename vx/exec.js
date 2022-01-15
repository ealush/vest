const execSync = require('child_process').execSync;

const asyncExecute = require('async-execute');

const joinTruthy = require('./util/joinTruthy');

const logger = require('vx/logger');

function exec(
  command,
  {
    exitOnFailure = true,
    throwOnFailure = false,
    silent = false,
    raw = false,
  } = {}
) {
  const cmd = joinTruthy(command?.flat?.() ?? command, ' ');

  if (!raw && !silent) {
    logger.info(`🎬 Executing command: "${cmd}"`);
  }

  execCommand(cmd, { silent, throwOnFailure, exitOnFailure });
}

exec.async = function (command, options = { pipe: true }) {
  const cmd = joinTruthy(command?.flat?.() ?? command, ' ');

  return asyncExecute(cmd, options);
};

module.exports = exec;

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
    stdio: silent ? 'ignore' : 'inherit',
  });
}

function exit() {
  process.exit(1);
}
