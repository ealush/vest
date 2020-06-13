const glob = require('glob');

const { default: isDeepCopy } = require('../../shared/testUtils/isDeepCopy');
const { packagePath } = require('../../util');

global.isWatchMode = (process.argv || []).some(
  arg => arg && arg.includes('--watch')
);

glob.sync(packagePath('**', 'jest.setup.js')).forEach(require);

/* eslint-disable */
test.skipOnWatch = (...args) => {
  if (global.isWatchMode) {
    return test.skip(...args);
  }

  return test(...args);
};

expect.extend({
  isDeepCopyOf: isDeepCopy,
});
/* eslint-enable */
