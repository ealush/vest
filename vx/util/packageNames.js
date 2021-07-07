const path = require('path');

module.exports = Object.defineProperty(
  { paths: {}, list: [], names: {} },
  'current',
  {
    get: () => {
      return packageName();
    },
  }
);

const glob = require('glob');

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

function packageName() {
  const name = process.env.npm_package_name;
  if (!packageName) {
    throw new Error(`Package name not found`);
  }

  return name;
}
