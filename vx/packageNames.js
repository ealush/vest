const path = require('path');

const glob = require('glob');

const packageName = require('vx/packageName'); // eslint-disable-line

const vxPath = require('vx/vxPath');

module.exports = Object.defineProperty(
  { paths: {}, list: [], names: {} },
  'current',
  {
    get: () => {
      return packageName();
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
