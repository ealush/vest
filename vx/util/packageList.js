const path = require('path');

const { glob } = require('glob');

const vxPath = require('vx/vxPath');

// Unordered list of package names
module.exports.pairs = glob
  .sync(vxPath.package('*'))
  .reduce((packages, packagePath) => {
    packages.push([path.basename(packagePath), packagePath]);
    return packages;
  }, []);

module.exports.names = module.exports.pairs.map(([name]) => name);
