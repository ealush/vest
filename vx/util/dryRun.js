const logger = require('vx/logger');

const DRY_RUN_KEY = 'VX_DRY_RUN';

module.exports = {
  cliOpt,
  dryRunExitMessage,
  isDryRun,
  setDryRun,
};

function setDryRun(dry) {
  process.env[DRY_RUN_KEY] = !!dry;
}

function isDryRun() {
  return JSON.parse(process.env[DRY_RUN_KEY] ?? false);
}

function cliOpt() {
  if (!isDryRun()) {
    return '';
  }

  return '--dry';
}

function dryRunExitMessage(fn) {
  logger.info(`${fn.name} Dry run. Exiting.`);
}
