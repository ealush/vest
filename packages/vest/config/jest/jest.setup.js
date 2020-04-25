const { PACKAGE_NAME_VEST } = require('../../../../scripts/constants');
const { packageJson, packagePath } = require('../../../../util');

const { version } = packageJson(PACKAGE_NAME_VEST);

const MOCK_SYMBOLS = {
  SYMBOL_STATE: Symbol('mock_vest_state'),
  SYMBOL_SUITES: Symbol('mock_vest_suites'),
  SYMBOL_CANCELED: Symbol('mock_vest_canceled'),
};

const mockSymbols = () => {
  jest.resetModules();
  jest.mock(packagePath('vest/src/core/state/symbols'), () => ({
    __esModule: true,
    ...MOCK_SYMBOLS,
  }));
};

mockSymbols();

global.VEST_VERSION = version;

// Registers global instance
require(packagePath(PACKAGE_NAME_VEST, 'src'));
