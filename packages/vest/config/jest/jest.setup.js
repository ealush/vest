const { packageJson, packagePath, packageNames } = require('../../../../util');

const { version } = packageJson(packageNames.VEST);
global.LIBRARY_NAME = packageNames.VEST;
global.__LIB_VERSION__ = version;
global.ENV_DEVELOPMENT = true;

// Registers global instance
require(packagePath(packageNames.VEST, 'src'));
