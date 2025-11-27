import { execSync } from 'child_process';

import IGNORE_PATTERN from './commitIgnorePattern.js';

import * as logger from 'vx/logger.js';
import { STABLE_BRANCH, CURRENT_BRANCH } from 'vx/util/taggedBranch.js';

/**
 * Lists all the commits and their changed files:
 * Returns an array of objects that look like this:
 *
 * [{title: "...", files: ["..."]}]
 * @returns {{ title: string, files: string[] }[]} Commits from stable to current branch.
 */
function listAllChangesSinceStableBranch() {
  execSync(`git fetch origin ${STABLE_BRANCH}`);

  const output = execSync(
    `git log origin/${STABLE_BRANCH}..origin/${CURRENT_BRANCH} --name-only --pretty='format:%h  %s (%an)'`,
  );

  logger.log(
    `All changes between origin/${STABLE_BRANCH}..origin/${CURRENT_BRANCH}: `,
    output.toString(),
  );

  return output
    .toString()
    .split('\n\n') // split each commit
    .map(
      commit =>
        commit
          .split('\n') // split each line of each commit
          .filter(Boolean), // ignore empty lines
    )
    .filter(([title]) => !title?.match(IGNORE_PATTERN) ?? false) // ignore excluded terms
    .map(([title, ...files]) => ({
      title,
      files,
    }))
    .filter(({ title }) => Boolean(title));
}

export default listAllChangesSinceStableBranch;
