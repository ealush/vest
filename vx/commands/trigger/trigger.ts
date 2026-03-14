import * as logger from 'vx/logger.js';
import exec from 'vx/exec.js';

export default function trigger({
  cliOptions,
}: { cliOptions?: string } = {}): void {
  const targetBranch = cliOptions?.trim();
  const validBranches = ['dummy', 'release', 'next', 'integration'];

  if (!targetBranch || !validBranches.includes(targetBranch)) {
    logger.error(
      `❌  Invalid or missing target branch. Expected one of: ${validBranches.join(
        ', ',
      )}`,
    );
    return;
  }

  logger.info(`🏃 Triggering CI for ${targetBranch}.`);

  // Ensure local latest is up to date
  exec(
    [
      'git fetch origin latest',
      'git checkout latest',
      'git pull origin latest',
    ].join(' && '),
  );

  // Force local target branch to point to latest, and force push it
  exec(
    [
      `git branch -f ${targetBranch} latest`,
      `git push origin ${targetBranch} --force`,
    ].join(' && '),
  );

  logger.info(`✅  Triggered CI for ${targetBranch}.`);
}
