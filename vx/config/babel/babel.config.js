const opts = require('vx/opts');

const env = api => {
  const conf = {
    targets: {},
  };

  switch (api.env()) {
    case opts.env.DEVELOPMENT:
      conf.targets.chrome = 52;
      break;
    default:
      conf.targets.ie = 10;
      break;
  }

  return ['@babel/preset-env', conf];
};

module.exports = api => {
  const presets = [env(api)];

  const plugins = [
    api.env(opts.env.PRODUCTION) && '@babel/plugin-transform-object-assign',
  ].filter(Boolean);

  return {
    include: [new RegExp(opts.dir.PACKAGES), /testUtils/, /node_modules/],
    presets,
    plugins,
  };
};
