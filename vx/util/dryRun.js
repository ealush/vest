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
  // FIXME: Check why this is sometimes gets set to a string
  return [true, 'true'].includes(process.env[DRY_RUN_KEY]);
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
