import { packageNames } from 'vx/packageNames.js';
import { usePackage, withPackage } from 'vx/vxContext.js';

/**
 * Runs a callback for the active package or iterates over all packages when none is selected.
 * @template {(...args: any[]) => any} T
 * @param {T} callback Function to invoke within each package context.
 * @param {...Parameters<T>} args Arguments forwarded to the callback.
 * @returns {void}
 */
export default function runOnActivePackages(callback, ...args) {
  const packages = packageNames;
  const name = usePackage();

  if (name) {
    return callback(...args);
  }
  packages.list.forEach(packageName =>
    withPackage(packageName, () => callback(...args)),
  );
}
