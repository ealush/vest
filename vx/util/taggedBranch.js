const {
  CURRENT_BRANCH = process.env.GITHUB_REF_NAME ?? 'LOCAL_DEVELOPMENT',
  INTEGRATION_BRANCH,
  NEXT_BRANCH,
  LATEST_BRANCH,
  STABLE_BRANCH,
  RELEASE_BRANCH,
} = process.env;
const packageNames = require('vx/packageNames');

const isIntegrationBranch = CURRENT_BRANCH.startsWith(INTEGRATION_BRANCH);
const isNextBranch = CURRENT_BRANCH.startsWith(NEXT_BRANCH);
const isLatestBranch = CURRENT_BRANCH.startsWith(LATEST_BRANCH);
const isStableBranch = CURRENT_BRANCH.startsWith(STABLE_BRANCH);
const isReleaseBranch = CURRENT_BRANCH.startsWith(RELEASE_BRANCH);
const [, target = undefined] =
  isIntegrationBranch || isNextBranch ? CURRENT_BRANCH.split('-') : [];

const branchAllowsRelease =
  isReleaseBranch || isNextBranch || isIntegrationBranch;

module.exports = {
  CURRENT_BRANCH,
  INTEGRATION_BRANCH,
  LATEST_BRANCH,
  NEXT_BRANCH,
  RELEASE_BRANCH,
  STABLE_BRANCH,
  branchAllowsRelease,
  isIntegrationBranch,
  isLatestBranch,
  isNextBranch,
  isReleaseBranch,
  isStableBranch,
  targetPackage: packageNames.names[target],
};
