const env = api => {
  const conf = {
    targets: {},
    ...(!api.env('test') && {
      loose: true,
    }),
  };

  switch (api.env()) {
    case 'es6':
    case 'development':
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
    'babel-plugin-add-module-exports',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    ['@babel/plugin-proposal-pipeline-operator', { proposal: 'minimal' }],
    api.env('production') && '@babel/plugin-transform-object-assign',
    api.env('test') && '@babel/plugin-transform-runtime',
  ].filter(Boolean);

  return {
    include: [/src/, /testUtils/, /node_modules/],
    presets,
    plugins,
  };
};
