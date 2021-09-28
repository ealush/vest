const { createContext } = require('context');

const ctx = createContext();

function withPackage(packageName, callback) {
  if (!packageName) {
    return callback();
  }

  process.env.VX_PACKAGE_NAME = packageName;
  return ctx.run({ packageName }, () => callback());
}

function usePackage() {
  return ctx.use()?.packageName ?? process.env.VX_PACKAGE_NAME; // VX_PACKAGE_NAME is only used by rollup (buildPackage.js);
}

module.exports = {
  withPackage,
  usePackage,
};
