const { PACKAGE_VEST } = require('../../../../shared/constants');
const { packageJson, packagePath } = require('../../../../util');

const { version } = packageJson(PACKAGE_VEST);

global.VEST_VERSION = version;

// Registers global instance
require(packagePath(PACKAGE_VEST, 'src'));
