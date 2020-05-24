const path = require('path');

const ROOT_PATH = process.cwd();
const CONFIG_PATH = path.resolve(ROOT_PATH, 'config');
const PACKAGES_PATH = path.resolve(ROOT_PATH, 'packages');
const BABEL_CONFIG_PATH = path.resolve(CONFIG_PATH, 'babel', 'babel.config.js');

module.exports = {
  ROOT_PATH,
  CONFIG_PATH,
  PACKAGES_PATH,
  BABEL_CONFIG_PATH,
};
