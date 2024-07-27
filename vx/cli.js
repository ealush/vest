#!/usr/bin/env node

const path = require('path');

const dotenv = require('dotenv');
const glob = require('glob');
const { hideBin } = require('yargs/helpers');
const yargs = require('yargs/yargs');

const logger = require('vx/logger');
const packageNames = require('vx/packageNames');
const joinTruthy = require('vx/util/joinTruthy');
const { usePackage } = require('vx/vxContext');
const ctx = require('vx/vxContext');
const vxPath = require('vx/vxPath');

dotenv.config();

const commands = glob
  .sync(path.join(vxPath.VX_COMMANDS_PATH, '*/*.js'), {
    cwd: vxPath.VX_ROOT_PATH,
    absolute: true,
  })
  .reduce((commands, command) => {
    return Object.assign(commands, {
      [path.basename(command, '.js')]: require(command),
    });
  }, {});

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
  .option('fastBuild', {
    demandOption: false,
    describe: 'build format',
  })
  .help().argv;

const { package, command, fastBuild, _: cliOptions = [] } = cli;

// Prepare all packages before running any other command.
if (command !== 'prepare') {
  commands.prepare();
}

if (!commands[command]) {
  throw new Error(`Command ${command} not found.`);
}

logger.info(
  joinTruthy([
    `Running command ${command}`,
    package && `for package ${package}`,
  ]),
);

ctx.withPackage(package, () =>
  commands[command]({
    fastBuild,
    cliOptions: cliOptions.join(' '),
  }),
);

function insidePackageDir() {
  if (!process.cwd().includes(vxPath.PACKAGES_PATH)) {
    return;
  }

  const match = Object.entries(packageNames.paths).find(([, packagePath]) => {
    return process.cwd().includes(packagePath);
  });

  return Array.isArray(match) ? match[0] : undefined;
}
