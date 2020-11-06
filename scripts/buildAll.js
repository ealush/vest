const [packageName] = process.argv.slice(2);

require('./build')(packageName);
