const packageNames = require('vx/packageNames');
const { usePackage } = require('vx/vxContext');
const ctx = require('vx/vxContext');

module.exports = (callback, ...args) => {
  const packages = packageNames;
  const name = usePackage();

  if (name) {
    return callback(...args);
  }
  packages.list.forEach(packageName =>
    ctx.withPackage(packageName, () => callback(...args)),
  );
};
