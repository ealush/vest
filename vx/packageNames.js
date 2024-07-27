const path = require('path');

const glob = require('glob');

const { sortDependencies } = require('./scripts/release/depsTree');

const packageJson = require('vx/util/packageJson');
const packageList = require('vx/util/packageList');
const { usePackage } = require('vx/vxContext');
const vxPath = require('vx/vxPath');

module.exports = Object.defineProperty(
  { paths: {}, list: [], names: {} },
  'current',
  {
    get: () => {
      return usePackage();
    },
  },
);

packageList.pairs.forEach(([name, path]) => {
  module.exports.paths[name] = path;
  module.exports.names[name] = name;
});

module.exports.list = sortDependencies(packageList.names);
