const execSync = require('child_process').execSync;

const vxPath = require('./vxPath');

const logger = require('vx/logger');
const joinTruthy = require('vx/util/joinTruthy');

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
    cwd: vxPath.VX_ROOT_PATH,
    stdio: silent ? 'ignore' : 'inherit',
  });
}

function exit() {
  process.exit(1);
}
