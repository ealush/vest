const { packageJson, packageNames } = require('../../../../util');

const { version } = packageJson(packageNames.VEST);
global.LIBRARY_NAME = packageNames.VEST;
global.__LIB_VERSION__ = version;
global.__DEV__ = true;
global.ENV_DEVELOPMENT = true;

// Registers global instance
require(packageNames.VEST);
