const { exec, logger, packagePath } = require('../../../util');

const { EMAIL_ADDRESS, GIT_NAME } = process.env;

function publishPackage({ packageName, tag, tagId }) {
  const command = [
    `yarn publish ${packagePath(packageName)}`,
    tag && tagId && `--new-version ${tagId}`,
    tag && `--tag ${tag}`,
  ]
    .filter(Boolean)
    .join(' ');

  logger.info('🚀 Publishing package.');
  exec(
    `
git config --global user.email "${EMAIL_ADDRESS}"
git config --global user.name "${GIT_NAME}"
${command}
git tag -d ${tagId}`,
    { exitOnFailure: false }
  );
}

module.exports = publishPackage;
