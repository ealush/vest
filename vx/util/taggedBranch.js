import { packageNames } from 'vx/packageNames.js';

const {
  CURRENT_BRANCH = process.env.GITHUB_REF_NAME ?? 'LOCAL_DEVELOPMENT',
  INTEGRATION_BRANCH,
  NEXT_BRANCH,
  NIGHTLY_BRANCH,
  LATEST_BRANCH,
  STABLE_BRANCH,
  RELEASE_BRANCH,
  RELEASE_KEEP_VERSION_BRANCH,
} = process.env;

/** @type {boolean} */
const isIntegrationBranch = CURRENT_BRANCH.startsWith(INTEGRATION_BRANCH);
/** @type {boolean} */
const isNextBranch = CURRENT_BRANCH.startsWith(NEXT_BRANCH);
/** @type {boolean} */
const isNightlyBranch = CURRENT_BRANCH.startsWith(NIGHTLY_BRANCH);
/** @type {boolean} */
const isLatestBranch = CURRENT_BRANCH.startsWith(LATEST_BRANCH);
/** @type {boolean} */
const isStableBranch = CURRENT_BRANCH.startsWith(STABLE_BRANCH);
/** @type {boolean} */
const isReleaseBranch = CURRENT_BRANCH.startsWith(RELEASE_BRANCH);
/** @type {boolean} */
const isReleaseKeepVersionBranch = CURRENT_BRANCH.startsWith(
  RELEASE_KEEP_VERSION_BRANCH,
);
/** @type {[string | undefined, string | undefined]} */
const [, target = undefined] =
  isIntegrationBranch || isNextBranch || isNightlyBranch
    ? CURRENT_BRANCH.split('-')
    : [];

const branchAllowsRelease =
  isReleaseBranch || isNextBranch || isIntegrationBranch || isNightlyBranch;

export {
  CURRENT_BRANCH,
  INTEGRATION_BRANCH,
  LATEST_BRANCH,
  NEXT_BRANCH,
  NIGHTLY_BRANCH,
  RELEASE_BRANCH,
  STABLE_BRANCH,
  branchAllowsRelease,
  isIntegrationBranch,
  isLatestBranch,
  isNextBranch,
  isNightlyBranch,
  isReleaseBranch,
  isReleaseKeepVersionBranch,
  isStableBranch,
};
export const targetPackage = packageNames.names[target];
