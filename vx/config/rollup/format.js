const opts = require('vx/opts');
const yargs = require('yargs/yargs');

const format = [].concat(
  yargs(process.argv).argv.format ?? [
    opts.format.CJS,
    opts.format.ES,
    opts.format.UMD,
  ]
);

const disallowExternals = format === opts.format.UMD;

module.exports = {
  format,
  disallowExternals,
};
