module.exports = function packageName() {
  const name = process.env.npm_package_name;

  return name;
};
