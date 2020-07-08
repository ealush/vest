module.exports = api => {
  let isTest = false;
  if (api) {
    isTest = api.env() === 'test';
    api.cache(true);
  }

  const presets = [
    [
      '@babel/preset-env',
      {
        ...(!isTest && {
          loose: true,
        }),
      },
    ],
  ];

  const plugins = [
    'babel-plugin-add-module-exports',
    '@babel/plugin-transform-object-assign',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    ['@babel/plugin-proposal-pipeline-operator', { proposal: 'minimal' }],
    isTest && '@babel/plugin-transform-runtime',
  ].filter(Boolean);

  return {
    include: [/src/, /testUtils/, /node_modules/],
    presets,
    plugins,
  };
};
