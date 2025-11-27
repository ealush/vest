import { execSync } from 'child_process';

import * as logger from 'vx/logger.js';
import joinTruthy from 'vx/util/joinTruthy.js';
import vxPath from 'vx/vxPath.js';

type ExecCommand = string | Array<string | string[] | undefined>;

type ExecOptions = {
  exitOnFailure?: boolean;
  throwOnFailure?: boolean;
  silent?: boolean;
  raw?: boolean;
  env?: Record<string, string | undefined>;
};

export default function exec(
  command: ExecCommand,
  {
    exitOnFailure = true,
    throwOnFailure = false,
    silent = false,
    raw = false,
    env,
  }: ExecOptions = {},
): void {
  const cmd = joinTruthy(
    Array.isArray(command) ? command.flat() : command,
    ' ',
  );

  if (!raw && !silent) {
    logger.info(`🎬 Executing command: "${cmd}"`);
  }

  execCommand(cmd, { exitOnFailure, silent, throwOnFailure, env });
}

/**
 * Executes command and handles failures based on options.
 */
function execCommand(
  command: string,
  {
    silent,
    throwOnFailure,
    exitOnFailure,
    env,
  }: Pick<ExecOptions, 'silent' | 'throwOnFailure' | 'exitOnFailure' | 'env'>,
): void {
  try {
    run(command, silent, env);
  } catch (err) {
    if (throwOnFailure) {
      throw err;
    }

    logger.error(err instanceof Error ? err.message : String(err));

    if (exitOnFailure) exit();
  }
}

/**
 * Runs a command synchronously.
 */
function run(
  command: string,
  silent?: boolean,
  env: Record<string, string | undefined> = process.env,
): void {
  execSync(command, {
    // Run commands from the repo root so workspace binaries are available.
    cwd: vxPath.ROOT_PATH,
    stdio: silent ? 'ignore' : 'inherit',
    env,
  });
}

/**
 * Exits the process with error code 1.
 */
function exit(): never {
  process.exit(1);
}
