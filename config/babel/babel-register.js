const { BABEL_CONFIG_PATH } = require('..');

require('@babel/register')({
  configFile: BABEL_CONFIG_PATH,
});
