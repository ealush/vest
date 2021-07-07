#!/usr/bin/env node

const path = require('path');

const glob = require('glob');
const { hideBin } = require('yargs/helpers');
const yargs = require('yargs/yargs');

const packageNames = require('./util/packageNames');
const vxPath = require('vx/vxPath');

require('./scripts/genTsConfig');

const { _: args, ...options } = yargs(hideBin(process.argv)).argv;

const [command, target = insidePackageDir()] = args;

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

if (!commands[command]) {
  throw new Error(`Command ${command} not found.`);
}

commands[command](target, options);

function insidePackageDir() {
  if (!process.cwd().includes(vxPath.PACKAGES_PATH)) {
    return;
  }

  const match = Object.entries(packageNames.paths).find(([, packagePath]) => {
    return process.cwd().includes(packagePath);
  });

  return Array.isArray(match) ? match[0] : undefined;
}
