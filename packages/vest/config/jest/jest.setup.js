const { PACKAGE_NAME_VEST } = require('../../../../scripts/constants');
const { packageJson, packagePath } = require('../../../../util');

const { version } = packageJson(PACKAGE_NAME_VEST);

global.VEST_VERSION = version;

// Registers global instance
require(packagePath(PACKAGE_NAME_VEST, 'src'));
