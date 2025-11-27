import exec from 'vx/exec.js';

/**
 * Runs formatting on staged files before commit.
 */
export default function precommit(): void {
  exec('npx lint-staged');
}
