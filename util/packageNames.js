const { readdirSync } = require('fs');

const filePaths = require('./filePaths');

const PACKAGE_NAMES = readdirSync(filePaths.PACKAGES_PATH).filter(
  dn => dn !== filePaths.DIR_NAME_SHARED
);

const PACKAGE_VEST = 'vest';
const PACKAGE_N4S = 'n4s';
const PACKAGE_ANYONE = 'anyone';

module.exports = {
  ALL_PACKAGES: PACKAGE_NAMES,
  ANYONE: PACKAGE_ANYONE,
  N4S: PACKAGE_N4S,
  VEST: PACKAGE_VEST,
};
