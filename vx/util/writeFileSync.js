const fs = require('fs');

const logger = require('vx/logger');
const dryRun = require('vx/util/dryRun');

module.exports = writeFileSync;

function writeFileSync(filePath, data, options) {
  if (dryRun.isDryRun()) {
    return logger.info(`Dry run. Not writing to disk.
      Would normally write to ${filePath}
    `);
  }

  return fs.writeFileSync(filePath, data, options);
}
