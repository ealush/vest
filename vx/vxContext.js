const { createContext } = require('context');

const ctx = createContext();

/**
 * Runs a callback within the provided package context.
 * @param {string | undefined} packageName Name of package to set in context.
 * @param {() => any} callback Function executed with context set.
 * @returns {any} Callback result.
 */
function withPackage(packageName, callback) {
  if (!packageName) {
    return callback();
  }

  process.env.VX_PACKAGE_NAME = packageName;
  return ctx.run({ packageName }, () => callback());
}

/**
 * Retrieves the currently scoped package name, if any.
 * @returns {string | undefined}
 */
function usePackage() {
  return ctx.use()?.packageName ?? process.env.VX_PACKAGE_NAME;
}

module.exports = {
  withPackage,
  usePackage,
};
