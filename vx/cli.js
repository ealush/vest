#!/usr/bin/env node

const path = require('path');

const dotenv = require('dotenv');
const glob = require('glob');
const { hideBin } = require('yargs/helpers');
const yargs = require('yargs/yargs');

const logger = require('vx/logger');
const packageName = require('vx/packageName');
const packageNames = require('vx/packageNames');
const dryRun = require('vx/util/dryRun');
const vxPath = require('vx/vxPath');

dotenv.config();

const commands = glob
  .sync(`./commands/*.js`, {
    cwd: vxPath.VX_ROOT_PATH,
  })
  .reduce(
    (commands, command) =>
      Object.assign(commands, {
        [path.basename(command, '.js')]: require(command),
      }),
    {}
  );

require('./scripts/genTsConfig');

const argv = hideBin(process.argv);

const namedOptions = Object.entries({
  '--package': 2,
  '-p': 2,
  '--dry': 1,
});

const cli = yargs(argv)
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
    default: packageName() ?? insidePackageDir(),
    demandOption: false,
    describe: 'Package to run against',
  })
  .option('dry', {
    demandOption: false,
    describe: 'Avoid destructive actions.',
    global: true,
    nargs: 0,
    type: 'boolean',
  })
  .help().argv;

const { package, command, dry = false } = cli;

if (!commands[command]) {
  throw new Error(`Command ${command} not found.`);
}
// FIXME: is there a better way of doing this?
const options = argv.slice(
  namedOptions.reduce((count, [option, increment]) => {
    return argv.includes(option) ? count + increment : count;
  }, 1)
);

logger.info(`Running command ${command} for package ${package}.`);

dryRun.setDryRun(dry);

commands[command](package, {
  options,
});

function insidePackageDir() {
  if (!process.cwd().includes(vxPath.PACKAGES_PATH)) {
    return;
  }

  const match = Object.entries(packageNames.paths).find(([, packagePath]) => {
    return process.cwd().includes(packagePath);
  });

  return Array.isArray(match) ? match[0] : undefined;
}
