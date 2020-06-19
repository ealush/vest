const { readdirSync } = require('fs');
const path = require('path');
const { PACKAGES_DIR } = require('../shared/constants.js');

const ROOT_PATH = process.cwd();
const CONFIG_PATH = path.resolve(ROOT_PATH, 'config');
const PACKAGES_PATH = path.resolve(ROOT_PATH, PACKAGES_DIR);
const BABEL_CONFIG_PATH = path.resolve(CONFIG_PATH, 'babel', 'babel.config.js');
const PACKAGE_NAMES = readdirSync(PACKAGES_PATH);

module.exports = {
  BABEL_CONFIG_PATH,
  CONFIG_PATH,
  PACKAGE_NAMES,
  PACKAGES_PATH,
  ROOT_PATH,
};
