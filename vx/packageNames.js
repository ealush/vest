const { sortDependencies } = require('./scripts/release/depsTree');

const packageList = require('vx/util/packageList');
const { usePackage } = require('vx/vxContext');

/**
 * @typedef {{ paths: Record<string, string>, list: string[], names: Record<string, string>, current?: string }} PackageNames
 */

/** @type {PackageNames} */
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
