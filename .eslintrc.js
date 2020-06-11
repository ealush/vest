const skipWords = require('./config/eslint/spellCheckerSkip');

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
    VEST_VERSION: true,
    LIBRARY_NAME: true,
  },
  ignorePatterns: ['playground'],
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
  plugins: ['jest', 'spellcheck'],

  rules: {
    'arrow-body-style': [2, 'as-needed'],
    'import/newline-after-import': 2,
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
    'jest/expect-expect': 0,
    'jest/no-identical-title': 0,
    'jest/no-standalone-expect': 0,
    'max-params': [2, { max: 3 }],
    'no-console': 2,
    'no-duplicate-imports': 2,
    'no-implicit-globals': 2,
    'no-lonely-if': 2,
    'no-multi-spaces': 1,
    'no-trailing-spaces': [2, { ignoreComments: false }],
    'no-unneeded-ternary': 2,
    'no-unused-expressions': 2,
    'no-useless-catch': 2,
    'no-useless-computed-key': 2,
    'no-useless-return': 2,
    'no-var': 2,
    'no-warning-comments': 2,
    'object-shorthand': [2, 'always', { avoidQuotes: true }],
    'prefer-arrow-callback': 2,
    'prefer-const': 2,
    'sort-keys': [
      1,
      'asc',
      {
        natural: true,
        minKeys: 4,
      },
    ],
    'spellcheck/spell-checker': [
      1,
      {
        strings: false,
        identifiers: false,
        skipWords,
      },
    ],
  },
};
