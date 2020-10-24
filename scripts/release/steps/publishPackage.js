const { exec, logger, packagePath } = require('../../../util');

function publishPackage({ packageName, tag }) {
  const command = [
    'npm',
    'publish',
    packagePath(packageName),
    tag && `--tag ${tag}`,
  ]
    .filter(Boolean)
    .join(' ');

  logger.info('🚀 Publishing package.');
  exec(command, { exitOnFailure: false });
}

module.exports = publishPackage;
