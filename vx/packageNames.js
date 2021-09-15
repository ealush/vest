const path = require('path');

const glob = require('glob');

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
  const packageJson = require(path.resolve(packagePath, 'package.json'));

  return !packageJson.private;
});

paths.forEach(packagePath => {
  const basename = path.basename(packagePath);

  module.exports.paths[basename] = packagePath;
  module.exports.names[basename] = basename;
  module.exports.list.push(basename);
});
