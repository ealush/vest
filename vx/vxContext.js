const createContext = require('context').default;

const ctx = createContext();

function withPackage(packageName, callback) {
  if (!packageName) {
    return callback();
  }

  process.env.VX_PACKAGE_NAME = packageName;
  return ctx.run({ packageName }, () => callback());
}

function usePackage() {
  return ctx.use()?.packageName;
}

module.exports = {
  withPackage,
  usePackage,
};
