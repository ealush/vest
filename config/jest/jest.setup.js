global.vestDistVersions = [];

const isWatchMode = (process.argv || []).some((arg) => (
    arg && arg.includes('--watch')
));

if (!isWatchMode) {
    global.vestDistVersions.push(
        require('../../dist/vest.js'),
        require('../../dist/vest.min.js'),
    );
}

const { version } = require('../../package.json');

global.VEST_VERSION = version;

// Registers global instance
require('../../src');
