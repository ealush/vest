const packageName = require('vx/packageName');
const packageNames = require('vx/packageNames');
const ctx = require('vx/vxContext');

module.exports = (callback, ...args) => {
  const packages = packageNames;
  const name = packageName();

  if (name) {
    return callback(...args);
  }
  packages.list.forEach(packageName =>
    ctx.withPackage(packageName, () => callback(...args))
  );
};
