const { filePaths, envNames } = require('../../util');

const env = api => {
  const conf = {
    targets: {},
    ...(!api.env(envNames.TEST) && {
      loose: true,
    }),
  };

  switch (api.env()) {
    case 'es6':
    case envNames.DEVELOPMENT:
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
    api.env(envNames.PRODUCTION) && '@babel/plugin-transform-object-assign',
    api.env(envNames.TEST) && '@babel/plugin-transform-runtime',
  ].filter(Boolean);

  return {
    include: [
      new RegExp(filePaths.DIR_NAME_PACKAGES),
      /testUtils/,
      /node_modules/,
    ],
    presets,
    plugins,
  };
};
