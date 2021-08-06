const { CURRENT_BRANCH = '', INTEGRATION_BRANCH } = process.env;

const isIntegrationBranch = CURRENT_BRANCH.startsWith(INTEGRATION_BRANCH);
const [, targetPackage = undefined] = isIntegrationBranch
  ? CURRENT_BRANCH.split('-')
  : [];

module.exports = {
  isIntegrationBranch,
  targetPackage,
};
