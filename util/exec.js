const execSync = require('child_process').execSync;
const logger = require('./logger');

function exec(command) {
  logger.info(`🎬 Executing command: "${command}"`);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (err) {
    logger.error(err.message);
    process.exit(1);
  }
}

module.exports = exec;
