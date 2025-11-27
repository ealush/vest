#!/usr/bin/env node
import { createRequire } from 'module';
import path from 'path';

import { config as dotenvConfig } from 'dotenv';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

import * as logger from 'vx/logger.js';
import { packageNames } from 'vx/packageNames.js';
import joinTruthy from 'vx/util/joinTruthy.js';
import { usePackage, withPackage } from 'vx/vxContext.js';
import vxPath from 'vx/vxPath.js';

const require = createRequire(import.meta.url);
const glob = require('glob');

dotenvConfig();

const commands = Object.fromEntries(
  glob
    .sync(path.join(vxPath.VX_COMMANDS_PATH, '*/*.js'), {
      cwd: vxPath.VX_ROOT_PATH,
      absolute: true,
    })
    .map(commandPath => [
      path.basename(commandPath, '.js'),
      // Dynamic import for ESM
      async (...args) => (await import(commandPath)).default(...args),
    ]),
);

const argv = hideBin(process.argv);

const defaultPackage = usePackage() ?? insidePackageDir();

const cli = yargs(argv)
  .parserConfiguration({ 'unknown-options-as-args': true })
  .command('$0 <command>', 'Run vx monorepo utility', yargs => {
    yargs.positional('command', {
      describe: 'Command to run',
      choices: Object.keys(commands),
      demandOption: true,
    });
  })
  .option('package', {
    alias: 'p',
    choices: packageNames.list,
    demandOption: false,
    describe: 'Package to run against',
    ...(!!defaultPackage && { default: defaultPackage }),
  })
  .help().argv;

const { package: pkg, command, _: cliOptions = [] } = cli;

// Prepare all packages before running any other command.
if (command !== 'prepare' && command !== 'dev') {
  await commands.prepare();
}

if (!commands[command]) {
  throw new Error(`Command ${command} not found.`);
}

logger.info(
  joinTruthy([`Running command ${command}`, pkg && `for package ${pkg}`]),
);

await withPackage(pkg, async () =>
  commands[command]({
    cliOptions: cliOptions.join(' '),
  }),
);

/**
 * Infers the package name from the current working directory if inside packages/.
 * @returns {string | undefined}
 */
function insidePackageDir() {
  if (!process.cwd().includes(vxPath.PACKAGES_PATH)) {
    return;
  }

  const match = Object.entries(packageNames.paths).find(([, packagePath]) => {
    return process.cwd().includes(packagePath);
  });

  return Array.isArray(match) ? match[0] : undefined;
}
