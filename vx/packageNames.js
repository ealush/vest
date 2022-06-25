const path = require('path');

const glob = require('glob');

const opts = require('vx/opts');
const packageJson = require('vx/util/packageJson');
const { usePackage } = require('vx/vxContext');
const vxPath = require('vx/vxPath');

module.exports = Object.defineProperty(
  { paths: {}, list: [], names: {} },
  'current',
  {
    get: () => {
      return usePackage();
    },
  }
);

const paths = glob.sync(vxPath.package('*')).filter(packagePath => {
  const packageJson = require(path.resolve(
    packagePath,
    opts.fileNames.PACKAGE_JSON
  ));

  return !packageJson.private;
});

paths.forEach(packagePath => {
  const basename = path.basename(packagePath);

  module.exports.paths[basename] = packagePath;
  module.exports.names[basename] = basename;
  module.exports.list.push(basename);
});

// Cheap sync alternative to depsTree. Might end up using this in the future.
module.exports.list = [
  ...module.exports.list.sort((packageA, packageB) => {
    const jsonA = packageJson(packageA);
    const jsonB = packageJson(packageB);

    if (jsonA?.dependencies?.[packageB]) {
      return 1;
    } else if (jsonB?.dependencies?.[packageA]) {
      return -1;
    } else {
      return 0;
    }
  }),
];
