const path = require('path');

const glob = require('glob');

const packageName = require('vx/packageName');

module.exports = Object.defineProperty(
  { paths: {}, list: [], names: {} },
  'current',
  {
    get: () => {
      return packageName();
    },
  }
);

const vxPath = require('vx/vxPath');

const paths = glob.sync(path.resolve(vxPath.PACKAGES_PATH, '*'), {
  ignore: '**/shared',
});

paths.forEach(packagePath => {
  const basename = path.basename(packagePath);

  module.exports.paths[basename] = packagePath;
  module.exports.names[basename] = basename;
  module.exports.list.push(basename);
});
