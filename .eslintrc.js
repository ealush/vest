const jsconfig = require('./jsconfig.json');

const paths = jsconfig.compilerOptions.paths;

const aliases = Object.keys(paths);

module.exports = {
  env: {
    es6: true,
    jest: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:jest/recommended',
    'plugin:jest/style',
    'plugin:import/errors',
    'plugin:import/warnings',
    'prettier',
  ],
  globals: {
    __DEV__: true,
    __LIB_VERSION__: true,
    ENV_DEVELOPMENT: true,
    LIBRARY_NAME: true,
  },
  ignorePatterns: ['playground'],
  overrides: [
    {
      files: ['./packages/*/src/**/*.js'],
      excludedFiles: '*.test.js',
      rules: {
        'import/no-relative-parent-imports': 2,
      },
    },
  ],
  parser: 'babel-eslint',
  parserOptions: {
    babelOptions: {
      configFile: 'config/babel/babel.config.js',
    },
    ecmaFeatures: {
      impliedStrict: true,
    },
    ecmaVersion: 10,
    sourceType: 'module',
  },
  plugins: ['jest'],

  rules: {
    'import/extensions': [2, 'never'],
    'import/first': 2,
    'import/newline-after-import': 1,
    'import/no-self-import': 2,
    'import/no-unresolved': [2, { ignore: aliases }],
    'import/no-useless-path-segments': 2,

    'import/order': [
      'error',
      {
        alphabetize: {
          order: 'asc',
        },
        'newlines-between': 'always',
        pathGroups: [{ pattern: `*(${aliases.join('|')})`, group: 'internal' }],
        pathGroupsExcludedImportTypes: ['builtin'],
      },
    ],
    'jest/expect-expect': 0,
    'jest/no-identical-title': 0,
    'jest/no-standalone-expect': 0,
    'max-params': [2, { max: 3 }],
    'no-console': 2,
    'no-duplicate-imports': 2,
    'no-implicit-globals': 2,
    'no-lonely-if': 2,
    'no-multi-spaces': 1,
    'no-prototype-builtins': 0,
    'no-trailing-spaces': [2, { ignoreComments: false }],
    'no-unneeded-ternary': 2,
    'no-unused-expressions': 2,
    'no-useless-catch': 2,
    'no-useless-computed-key': 2,
    'no-useless-return': 2,
    'no-var': 2,
    'no-warning-comments': 2,
    'object-shorthand': [2, 'always', { avoidQuotes: true }],
    'prefer-const': 2,
    'sort-keys': [
      1,
      'asc',
      {
        natural: true,
        minKeys: 4,
      },
    ],
  },
};
