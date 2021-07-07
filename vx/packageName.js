module.exports = function packageName() {
  const name = process.env.npm_package_name;
  if (!packageName) {
    throw new Error(`Package name not found`);
  }

  return name;
};
