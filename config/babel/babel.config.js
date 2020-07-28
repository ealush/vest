module.exports = api => {
  const presets = [
    [
      '@babel/preset-env',
      {
        targets: {
          ...(api.env('development')
            ? {
                node: 'current',
              }
            : {
                ie: 10,
              }),
        },
        ...(!api.env('test') && {
          loose: true,
        }),
      },
    ],
  ];

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
