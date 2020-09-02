const { PACKAGE_VEST } = require('../../../../shared/constants');
const { packageJson, packagePath } = require('../../../../util');

const { version } = packageJson(PACKAGE_VEST);
global.LIBRARY_NAME = PACKAGE_VEST;
global.VEST_VERSION = version;
global.ENV_DEVELOPMENT = true;

// Registers global instance
require(packagePath(PACKAGE_VEST, 'src'));
