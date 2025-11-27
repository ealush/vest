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

const isIntegrationBranch = Boolean(
  INTEGRATION_BRANCH && CURRENT_BRANCH.startsWith(INTEGRATION_BRANCH),
);
const isNextBranch = Boolean(
  NEXT_BRANCH && CURRENT_BRANCH.startsWith(NEXT_BRANCH),
);
const isNightlyBranch = Boolean(
  NIGHTLY_BRANCH && CURRENT_BRANCH.startsWith(NIGHTLY_BRANCH),
);
const isLatestBranch = Boolean(
  LATEST_BRANCH && CURRENT_BRANCH.startsWith(LATEST_BRANCH),
);
const isStableBranch = Boolean(
  STABLE_BRANCH && CURRENT_BRANCH.startsWith(STABLE_BRANCH),
);
const isReleaseBranch = Boolean(
  RELEASE_BRANCH && CURRENT_BRANCH.startsWith(RELEASE_BRANCH),
);
const isReleaseKeepVersionBranch = Boolean(
  RELEASE_KEEP_VERSION_BRANCH &&
    CURRENT_BRANCH.startsWith(RELEASE_KEEP_VERSION_BRANCH),
);
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
export const targetPackage = target ? packageNames.names[target] : undefined;
