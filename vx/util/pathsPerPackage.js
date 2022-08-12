const path = require('path');

const glob = require('glob');
const opts = require('vx/opts');
const vxPath = require('vx/vxPath');

const matches = glob.sync(vxPath.rel(vxPath.packageSrc('*', '**/*.ts')), {
  cwd: vxPath.ROOT_PATH,
  absolute: false,
  ignore: [
    vxPath.rel(vxPath.packageSrc('*', '**/*/index.ts')),
    vxPath.rel(vxPath.packageSrc('*', `**/${opts.dir.TESTS}/**/*`)),
  ],
});

const groupedMatches = matches.reduce((acc, relative) => {
  const name = path.basename(relative, '.ts');
  const package = vxPath.packageNameFromPath(relative);
  const absolute = path.join(vxPath.ROOT_PATH, relative);

  const moduleData = {
    absolute,
    name,
    package,
    relative,
  };

  acc[package] = (acc[package] || []).concat(moduleData);
  return acc;
}, {});

module.exports = {
  packages: groupedMatches,
  list: Object.entries(groupedMatches).map(([packageName, modules]) => ({
    packageName,
    modules,
  })),
};
