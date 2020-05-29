const skipWords = require('./config/eslint/spellCheckerSkip');

module.exports = {
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 10,
    sourceType: 'module',
    ecmaFeatures: {
      impliedStrict: true,
    },
    babelOptions: {
      configFile: 'config/babel/babel.config.js',
    },
  },
  plugins: ['jest', 'spellcheck'],
  env: {
    es6: true,
    jest: true,
    node: true,
  },
  globals: {
    VEST_VERSION: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:jest/recommended',
    'plugin:jest/style',
    'plugin:import/errors',
    'plugin:import/warnings',
    'prettier',
  ],
  rules: {
    'no-trailing-spaces': [2, { ignoreComments: false }],
    'no-implicit-globals': 2,
    'import/no-self-import': 2,
    'import/no-useless-path-segments': 2,
    'import/order': [
      'error',
      {
        alphabetize: {
          order: 'asc',
        },
        pathGroupsExcludedImportTypes: ['builtin'],
      },
    ],
    'import/newline-after-import': 2,
    'no-console': 2,
    'no-multi-spaces': 1,
    'no-warning-comments': 2,
    'no-useless-return': 2,
    'prefer-const': 2,
    'prefer-arrow-callback': 2,
    'no-var': 2,
    'no-useless-computed-key': 2,
    'jest/expect-expect': 0,
    'jest/no-identical-title': 0,
    'jest/no-standalone-expect': 0,
    'arrow-body-style': [2, 'as-needed'],
    'object-shorthand': [2, 'always', { avoidQuotes: true }],
    'spellcheck/spell-checker': [
      1,
      {
        skipWords,
      },
    ],
  },
  ignorePatterns: ['dist', 'node_modules', 'playground'],
};
