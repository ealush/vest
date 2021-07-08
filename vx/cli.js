#!/usr/bin/env node

const path = require('path');

const glob = require('glob');
const { hideBin } = require('yargs/helpers');
const yargs = require('yargs/yargs');

const packageNames = require('vx/packageNames');
const vxPath = require('vx/vxPath');

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

const cli = yargs(argv)
  .command('$0 <command> [options..]', 'Run vx monorepo utility', yargs => {
    yargs.positional('command', {
      describe: 'Command to run',
      choices: Object.keys(commands),
      demandOption: true,
    });
  })
  .option('packageName', {
    alias: 'p',
    choices: packageNames.list,
    demandOption: false,
    describe: 'Optional. Package to run the command on.',
  })
  .help().argv;

// is there a better way of doing this?
const options = argv.slice(cli.packageName ? 3 : 1).join(' ');

const { packageName = insidePackageDir(), command } = cli;

if (!commands[command]) {
  throw new Error(`Command ${command} not found.`);
}

commands[command](packageName, options);

function insidePackageDir() {
  if (!process.cwd().includes(vxPath.PACKAGES_PATH)) {
    return;
  }

  const match = Object.entries(packageNames.paths).find(([, packagePath]) => {
    return process.cwd().includes(packagePath);
  });

  return Array.isArray(match) ? match[0] : undefined;
}
