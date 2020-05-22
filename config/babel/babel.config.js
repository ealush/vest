module.exports = api => {
  if (api) {
    api.cache(true);
  }

  const presets = ['@babel/preset-env'];

  const plugins = [
    'babel-plugin-add-module-exports',
    '@babel/plugin-transform-object-assign',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    ['@babel/plugin-proposal-pipeline-operator', { proposal: 'minimal' }],
  ];

  return {
    include: [/src/, /testUtils/, /node_modules/],
    presets,
    plugins,
  };
};
