const glob = require('glob');

const { packagePath } = require('../../util');

global.isWatchMode = (process.argv || []).some(
  arg => arg && arg.includes('--watch')
);

glob.sync(packagePath('**', 'jest.setup.js')).forEach(require);
