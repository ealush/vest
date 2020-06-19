const execSync = require('child_process').execSync;
const logger = require('./logger');

function exec(command, { exitOnFailure = true } = {}) {
  logger.info(`🎬 Executing command: "${command}"`);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (err) {
    logger.error(err.message);

    if (exitOnFailure) {
      process.exit(1);
    }
  }
}

module.exports = exec;
