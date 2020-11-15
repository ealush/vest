const path = require('path');

const DIR_NAME_SHARED = '__shared';
const DIR_NAME_PACKAGES = 'packages';
const DIR_NAME_DIST = 'dist';
const DIR_NAME_SRC = 'src';
const ROOT_PATH = path.resolve(__dirname, '..');
const CONFIG_PATH = path.resolve(ROOT_PATH, 'config');
const PACKAGES_PATH = path.resolve(ROOT_PATH, DIR_NAME_PACKAGES);
const BABEL_CONFIG_PATH = path.resolve(CONFIG_PATH, 'babel', 'babel.config.js');

module.exports = {
  BABEL_CONFIG_PATH,
  CONFIG_PATH,
  DIR_NAME_DIST,
  DIR_NAME_PACKAGES,
  DIR_NAME_SHARED,
  DIR_NAME_SRC,
  PACKAGES_PATH,
  ROOT_PATH,
};
