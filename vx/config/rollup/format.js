const yargs = require('yargs/yargs');

const opts = require('vx/opts');

const format = yargs(process.argv).argv.format;
const disallowExternals = format === opts.format.UMD;

module.exports = {
  format,
  disallowExternals,
};
