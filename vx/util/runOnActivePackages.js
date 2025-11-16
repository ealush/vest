const packageNames = require('vx/packageNames');
const { usePackage } = require('vx/vxContext');
const ctx = require('vx/vxContext');

/**
 * Runs a callback for the active package or iterates over all packages when none is selected.
 * @template {(...args: any[]) => any} T
 * @param {T} callback Function to invoke within each package context.
 * @param {...Parameters<T>} args Arguments forwarded to the callback.
 * @returns {void}
 */
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
