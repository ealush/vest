const yargs = require('yargs/yargs');

const format = yargs(process.argv).argv.format;

module.exports = {
  format,
};
