#!/usr/bin/env node
import { createRequire } from 'module';
import path from 'path';

import { config as dotenvConfig } from 'dotenv';
import type { ArgumentsCamelCase } from 'yargs';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

import * as logger from 'vx/logger.js';
import { packageNames } from 'vx/packageNames.js';
import joinTruthy from 'vx/util/joinTruthy.js';
import { usePackage, withPackage } from 'vx/vxContext.js';
import vxPath from 'vx/vxPath.js';

type CommandOptions = Record<string, unknown> & {
  cliOptions?: string;
};

type CliCommand = (options?: CommandOptions) => unknown | Promise<unknown>;

type CommandModule = {
  default: CliCommand;
};

const require = createRequire(import.meta.url);
const glob: typeof import('glob') = require('glob');

dotenvConfig();

const commandEntries: Array<[string, CliCommand]> = glob
  .sync(path.join(vxPath.VX_COMMANDS_PATH, '*/*.{ts,js}'), {
    cwd: vxPath.VX_ROOT_PATH,
    absolute: true,
  })
  .map<[string, CliCommand]>(commandPath => {
    const commandName = path.basename(commandPath, path.extname(commandPath));

    return [
      commandName,
      async (...args: Parameters<CliCommand>) => {
        const module = (await import(commandPath)) as CommandModule;
        return module.default(...args);
      },
    ];
  });

const commands = Object.fromEntries(commandEntries) as Record<
  string,
  CliCommand
>;

const commandNames = Object.keys(commands);
const argv = hideBin(process.argv);

const defaultPackage = usePackage() ?? insidePackageDir();

type CliArguments = ArgumentsCamelCase<{
  command: string;
  package?: string;
}> & { _: (string | number)[] };

const cli = yargs(argv)
  .parserConfiguration({ 'unknown-options-as-args': true })
  .command('$0 <command>', 'Run vx monorepo utility', yargsInstance =>
    yargsInstance.positional('command', {
      describe: 'Command to run',
      choices: commandNames,
      demandOption: true,
    }),
  )
  .option('package', {
    alias: 'p',
    choices: packageNames.list,
    demandOption: false,
    describe: 'Package to run against',
    ...(defaultPackage ? { default: defaultPackage } : {}),
  })
  .help()
  .parseSync() as CliArguments;

const { package: pkg, command, _: cliOptions = [] } = cli;

const prepare = commands.prepare;

if (command !== 'prepare' && command !== 'dev') {
  await prepare();
}

const selectedCommand = commands[command];

if (!selectedCommand) {
  throw new Error(`Command ${command} not found.`);
}

logger.info(
  joinTruthy([`Running command ${command}`, pkg && `for package ${pkg}`], ' '),
);

await withPackage(pkg, async () =>
  selectedCommand({
    cliOptions: cliOptions.map(String).join(' '),
  }),
);

function insidePackageDir(): string | undefined {
  if (!process.cwd().includes(vxPath.PACKAGES_PATH)) {
    return undefined;
  }

  const match = Object.entries(packageNames.paths).find(([, packagePath]) =>
    process.cwd().includes(packagePath),
  );

  return Array.isArray(match) ? match[0] : undefined;
}
